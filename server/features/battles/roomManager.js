import { randomInt } from 'crypto';
import Problem from '../problems/Problem.model.js';
import Match from './Match.model.js';
import ActiveRoom from './ActiveRoom.model.js';
import BattleReplay from './BattleReplay.model.js';
import User from '../auth/User.model.js';
import { calculateRatings } from './rating.service.js';
import { getIO } from '../../core/io.js';
import {
  matchmakingQueue,
  rooms,
  createRoomState,
  findRoomByUserId,
  difficultyForRatings,
  addSnapshot,
} from './state.js';
import logger from '../../core/utils/logger.js';

const DISCONNECT_GRACE_MS = 20 * 1000; // time an opponent has to reconnect before auto-forfeit
const COMPLETED_ROOM_TTL_MS = 60 * 1000; // result screen, late events, rematch window
const REMATCH_WINDOW_MS = 45 * 1000;
const SNAPSHOT_PERSIST_INTERVAL_MS = 5000;

const watchChannel = (roomCode) => `watch:${roomCode}`;

function generateRoomCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I - easy to read aloud/type
  let code = '';
  for (let i = 0; i < 6; i++) code += alphabet[randomInt(alphabet.length)];
  return rooms.has(code) ? generateRoomCode() : code;
}

// Uses a random skip offset rather than $sample so the query goes through
// Mongoose's normal find path - hiddenTestCases (select: false on the
// schema) stays excluded. An aggregation $sample would bypass that
// projection entirely and could leak hidden test cases into battle:start.
// Prefers the difficulty that fits the players' ratings; falls back to any
// problem when the bank has none of that difficulty.
async function pickProblem(difficulty) {
  for (const filter of [{ difficulty }, {}]) {
    const count = await Problem.countDocuments(filter);
    if (count > 0) return Problem.findOne(filter).skip(randomInt(count));
  }
  throw new Error('No problems available to start a battle');
}

function socketById(socketId) {
  return socketId ? getIO()?.sockets.sockets.get(socketId) : undefined;
}

function emitToPlayer(player, event, data) {
  if (player?.socketId) getIO().to(player.socketId).emit(event, data);
}

function toPublicPlayer(player) {
  return { userId: player.userId, username: player.username, rating: player.rating, ready: !!player.ready };
}

function publicResults(room) {
  return room.players.map((p) => ({
    userId: p.userId,
    verdict: room.results[p.userId]?.verdict ?? null,
    passedCount: room.results[p.userId]?.passedCount ?? 0,
    totalCount: room.results[p.userId]?.totalCount ?? 0,
  }));
}

function remainingMs(room) {
  return room.startedAt ? Math.max(0, room.durationMs - (Date.now() - room.startedAt)) : room.durationMs;
}

function broadcastRoomState(roomCode) {
  const room = rooms.get(roomCode);
  if (!room) return;
  getIO().to(roomCode).emit('room:state', {
    roomCode,
    status: room.status,
    players: room.players.map(toPublicPlayer),
  });
}

// What a spectator sees: players, progress, clock and the problem - never
// code (see docs/api.md, "Spectators").
function spectatorState(room) {
  return {
    roomCode: room.roomCode,
    status: room.status,
    players: room.players.map(toPublicPlayer),
    progress: publicResults(room),
    problem: room.problem,
    durationMs: room.durationMs,
    remainingMs: remainingMs(room),
  };
}

// --- Persistence (restart-safe battles) ---

async function persistRoom(room) {
  if (room.status !== 'in_progress' || !room.matchId) return;
  room.lastPersistAt = Date.now();
  try {
    await ActiveRoom.findOneAndUpdate(
      { roomCode: room.roomCode },
      {
        roomCode: room.roomCode,
        players: room.players.map((p) => ({ userId: p.userId, username: p.username, rating: p.rating })),
        problem: room.problem._id,
        matchId: room.matchId,
        startedAt: new Date(room.startedAt),
        durationMs: room.durationMs,
        results: room.results,
        snapshots: room.snapshots,
        timeline: room.timeline,
      },
      { upsert: true }
    );
  } catch (err) {
    logger.error(`[Battle] Could not persist room ${room.roomCode}: ${err.message}`);
  }
}

// The clock holds the room object itself and stops if that room is no
// longer the live one (ended, or removed while a DB write was in flight).
function startBattleClock(room) {
  const { roomCode } = room;
  const io = getIO();
  clearInterval(room.timerInterval);
  room.timerInterval = setInterval(() => {
    if (rooms.get(roomCode) !== room || room.status !== 'in_progress') {
      clearInterval(room.timerInterval);
      return;
    }
    const left = remainingMs(room);
    if (left <= 0) {
      clearInterval(room.timerInterval);
      endBattle(roomCode, { reason: 'timeout' });
    } else {
      io.to(roomCode).to(watchChannel(roomCode)).emit('battle:timerSync', { remainingMs: left });
    }
  }, 1000);
}

// Mongo Mixed fields may hand dates back as strings.
function reviveDates(results) {
  for (const r of Object.values(results)) {
    if (r?.submittedAt && !(r.submittedAt instanceof Date)) r.submittedAt = new Date(r.submittedAt);
  }
  return results;
}

// Called once at boot, before the server accepts connections. Rebuilds
// every in-progress battle from Mongo and restarts its clock. Players get
// back in through handleReconnect when their browser reconnects. No forfeit
// timers are started for the restart itself - the battle clock decides.
export async function restoreActiveBattles() {
  const saved = await ActiveRoom.find();
  let restored = 0;
  for (const doc of saved) {
    const problem = await Problem.findById(doc.problem);
    if (!problem) {
      await ActiveRoom.deleteOne({ _id: doc._id });
      continue;
    }
    const [first, ...others] = doc.players.map((p) => ({ ...p.toObject(), socketId: null, ready: true }));
    const room = createRoomState(doc.roomCode, first);
    room.players.push(...others);
    Object.assign(room, {
      status: 'in_progress',
      problem,
      matchId: doc.matchId,
      startedAt: doc.startedAt.getTime(),
      durationMs: doc.durationMs,
      results: reviveDates(doc.results ?? {}),
      snapshots: doc.snapshots ?? {},
      timeline: doc.timeline ?? [],
    });
    if (remainingMs(room) <= 0) {
      await endBattle(doc.roomCode, { reason: 'timeout' });
    } else {
      startBattleClock(room);
      restored += 1;
    }
  }
  if (saved.length) logger.info(`[Battle] Restored ${restored} in-progress battle(s) after restart`);
  return restored;
}

// --- Private rooms (Create Room / Join Room / friend challenges) ---

// Creates a private room hosted by this socket's user. Returns the room
// code, or null (with room:error sent) if they are already busy.
export function createPrivateRoom(socket) {
  const userId = socket.user._id.toString();
  if (findRoomByUserId(userId) || matchmakingQueue.some((q) => q.userId === userId)) {
    socket.emit('room:error', { message: 'You are already in a room or the queue' });
    return null;
  }

  const roomCode = generateRoomCode();
  createRoomState(roomCode, {
    userId,
    socketId: socket.id,
    username: socket.user.username,
    rating: socket.user.rating,
    ready: false,
  });
  logger.info(`[Room] Room created: ${roomCode} (host: ${socket.user.username})`);
  socket.join(roomCode);
  broadcastRoomState(roomCode);
  return roomCode;
}

export function createRoom(socket) {
  const roomCode = createPrivateRoom(socket);
  if (roomCode) socket.emit('room:created', { roomCode });
}

export function joinRoom(socket, roomCode) {
  const room = rooms.get(roomCode);
  if (!room || room.status === 'completed') {
    return socket.emit('room:error', { message: 'Room not found' });
  }
  const userId = socket.user._id.toString();
  if (room.players.some((p) => p.userId === userId)) {
    // Already a player (e.g. opened the room link in another tab) - this
    // tab takes over instead of getting an error.
    return claimBattle(socket, roomCode);
  }
  if (room.players.length >= 2) {
    return socket.emit('room:error', { message: 'Room is already full' });
  }
  if (findRoomByUserId(userId)) {
    return socket.emit('room:error', { message: 'You are already in another room' });
  }

  room.players.push({
    userId,
    socketId: socket.id,
    username: socket.user.username,
    rating: socket.user.rating,
    ready: false,
  });
  logger.info(`[Room] ${socket.user.username} joined room ${roomCode}. Players: ${room.players.length}/2`);

  socket.join(roomCode);
  broadcastRoomState(roomCode);
}

export function setReady(socket, roomCode) {
  const room = rooms.get(roomCode);
  if (!room) return socket.emit('room:error', { message: 'Room not found' });

  const player = room.players.find((p) => p.userId === socket.user._id.toString());
  if (!player) return socket.emit('room:error', { message: 'You are not in this room' });
  if (room.status !== 'waiting') return;

  player.ready = true;
  broadcastRoomState(roomCode);

  if (room.players.length === 2 && room.players.every((p) => p.ready)) {
    startCountdown(roomCode);
  }
}

// --- Random matchmaking ---

export function joinQueue(socket) {
  const userId = socket.user._id.toString();
  if (findRoomByUserId(userId)) {
    return socket.emit('room:error', { message: 'You are already in a battle' });
  }
  if (matchmakingQueue.some((q) => q.userId === userId)) return;

  matchmakingQueue.push({ socketId: socket.id, userId, username: socket.user.username, rating: socket.user.rating });
  logger.info(`[Matchmaking] ${socket.user.username} queued. Queue size: ${matchmakingQueue.length}`);
  socket.emit('matchmaking:waiting');

  if (matchmakingQueue.length >= 2) {
    const [a, b] = matchmakingQueue.splice(0, 2);
    logger.info(`[Matchmaking] Opponent found: ${a.username} vs ${b.username}`);
    startRoomWith(a, b, 'matchmaking:found');
  }
}

// Puts two players in a new room, ready, and starts the countdown. Used by
// matchmaking and rematches.
function startRoomWith(a, b, event) {
  const roomCode = generateRoomCode();
  const room = createRoomState(roomCode, { ...a, ready: true });
  room.players.push({ ...b, ready: true });
  for (const p of room.players) socketById(p.socketId)?.join(roomCode);
  getIO().to(roomCode).emit(event, { roomCode });
  startCountdown(roomCode);
  return roomCode;
}

export function leaveQueue(socket) {
  const index = matchmakingQueue.findIndex((q) => q.socketId === socket.id);
  if (index !== -1) matchmakingQueue.splice(index, 1);
}

// --- Battle lifecycle ---

function startCountdown(roomCode) {
  const room = rooms.get(roomCode);
  if (!room) return;

  room.status = 'countdown';
  broadcastRoomState(roomCode);

  let secondsLeft = 5;
  const io = getIO();
  room.countdownInterval = setInterval(() => {
    io.to(roomCode).emit('room:countdown', { secondsLeft });
    secondsLeft -= 1;
    if (secondsLeft < 0) {
      clearInterval(room.countdownInterval);
      startBattle(roomCode);
    }
  }, 1000);
}

async function startBattle(roomCode) {
  const room = rooms.get(roomCode);
  if (!room || room.status !== 'countdown') return;

  try {
    const difficulty = difficultyForRatings(room.players.map((p) => p.rating));
    const problem = await pickProblem(difficulty);
    logger.info(`[Battle] "${problem.title}" (${problem.difficulty}, wanted ${difficulty}) for room ${roomCode}`);

    const match = await Match.create({
      problem: problem._id,
      players: room.players.map((p) => ({ user: p.userId, ratingBefore: p.rating })),
      durationMs: room.durationMs,
      startedAt: new Date(),
    });

    room.status = 'in_progress';
    room.problem = problem;
    room.matchId = match._id;
    room.startedAt = Date.now();
    for (const p of room.players) {
      room.results[p.userId] = { verdict: null, passedCount: 0, totalCount: 0, submittedAt: null, language: null };
      room.snapshots[p.userId] = [];
    }

    const io = getIO();
    io.to(roomCode).emit('battle:start', {
      roomCode,
      matchId: match._id,
      problem, // toJSON on the Mongoose document strips hiddenTestCases
      durationMs: room.durationMs,
      startedAt: room.startedAt,
      players: room.players.map(toPublicPlayer),
    });
    io.to(watchChannel(roomCode)).emit('spectate:state', spectatorState(room));

    await persistRoom(room);
    startBattleClock(room);
  } catch (err) {
    logger.error(`[Battle] Failed to start battle for room ${roomCode}: ${err.message}`);
    getIO().to(roomCode).emit('room:error', { message: 'Could not start the battle. Please try again.' });
  }
}

// Called by the REST /api/execute/submit controller after judging a
// submission made during a battle - bridges the HTTP judging flow into the
// real-time room state. Never receives or forwards hidden test case
// content, only the aggregate verdict. `code` is kept for the replay only.
export async function handleBattleSubmission(roomCode, userId, result, { language = null, code = null } = {}) {
  const room = rooms.get(roomCode);
  if (!room || room.status !== 'in_progress') return;
  if (!room.players.some((p) => p.userId === userId)) return;

  const t = Date.now() - room.startedAt;
  const existing = room.results[userId];
  // Keep the player's best attempt (highest passedCount) for the
  // timer-expiry tie-break, not just their most recent submission.
  if (!existing || result.passedCount >= existing.passedCount) {
    room.results[userId] = {
      verdict: result.verdict,
      passedCount: result.passedCount,
      totalCount: result.totalCount,
      submittedAt: new Date(),
      language,
    };
  }
  room.timeline.push({
    t,
    userId,
    verdict: result.verdict,
    passedCount: result.passedCount,
    totalCount: result.totalCount,
    language,
  });
  if (code !== null && language) addSnapshot((room.snapshots[userId] ??= []), { t, code, language });

  const summary = { verdict: result.verdict, passedCount: result.passedCount, totalCount: result.totalCount };
  const opponent = room.players.find((p) => p.userId !== userId);
  emitToPlayer(opponent, 'battle:opponentSubmitted', summary);
  getIO().to(watchChannel(roomCode)).emit('battle:progress', { userId, ...summary });

  if (result.verdict === 'Accepted') {
    clearInterval(room.timerInterval);
    await endBattle(roomCode, { forcedWinnerId: userId, reason: 'accepted' });
  } else {
    await persistRoom(room);
  }
}

// Periodic code snapshots from a player's editor, for the replay.
export function recordSnapshot(socket, { roomCode, code, language } = {}) {
  const room = rooms.get(roomCode);
  if (!room || room.status !== 'in_progress' || typeof code !== 'string' || typeof language !== 'string') return;
  const userId = socket.user._id.toString();
  const player = room.players.find((p) => p.userId === userId);
  if (!player || player.socketId !== socket.id) return;

  const stored = addSnapshot((room.snapshots[userId] ??= []), { t: Date.now() - room.startedAt, code, language });
  if (stored && Date.now() - room.lastPersistAt > SNAPSHOT_PERSIST_INTERVAL_MS) persistRoom(room);
}

function determineOutcome(room, forcedWinnerId) {
  const [p1, p2] = room.players;
  if (forcedWinnerId) {
    return { winnerId: forcedWinnerId, isDraw: false };
  }

  const r1 = room.results[p1.userId];
  const r2 = room.results[p2.userId];

  if (r1.passedCount !== r2.passedCount) {
    return { winnerId: r1.passedCount > r2.passedCount ? p1.userId : p2.userId, isDraw: false };
  }
  // Equal test cases passed - earlier submission wins; no submission at all
  // from either side (or an equal-passedCount tie with identical timing,
  // effectively impossible) is a draw.
  if (r1.submittedAt && r2.submittedAt) {
    if (r1.submittedAt.getTime() !== r2.submittedAt.getTime()) {
      return { winnerId: r1.submittedAt < r2.submittedAt ? p1.userId : p2.userId, isDraw: false };
    }
  } else if (r1.submittedAt && !r2.submittedAt) {
    return { winnerId: p1.userId, isDraw: false };
  } else if (!r1.submittedAt && r2.submittedAt) {
    return { winnerId: p2.userId, isDraw: false };
  }

  return { winnerId: null, isDraw: true };
}

async function saveReplay(room) {
  if (!room.matchId || !room.problem) return;
  try {
    await BattleReplay.create({
      match: room.matchId,
      problem: room.problem._id,
      durationMs: room.durationMs,
      players: room.players.map((p) => ({
        user: p.userId,
        username: p.username,
        snapshots: room.snapshots[p.userId] ?? [],
      })),
      timeline: room.timeline.map((e) => ({ ...e, user: e.userId })),
    });
  } catch (err) {
    logger.error(`[Battle] Could not save replay for room ${room.roomCode}: ${err.message}`);
  }
}

async function endBattle(roomCode, { forcedWinnerId = null } = {}) {
  const room = rooms.get(roomCode);
  if (!room || room.status === 'completed') return;

  room.status = 'completed';
  clearInterval(room.timerInterval);
  clearInterval(room.countdownInterval);
  Object.values(room.disconnectTimers).forEach(clearTimeout);

  const { winnerId, isDraw } = determineOutcome(room, forcedWinnerId);
  const [p1, p2] = room.players;
  const outcome = isDraw ? 'draw' : winnerId === p1.userId ? 'A' : 'B';
  const { ratingA, ratingB } = calculateRatings(p1.rating, p2.rating, outcome);
  const newRatings = { [p1.userId]: ratingA, [p2.userId]: ratingB };

  await Promise.all(
    room.players.map((p) => {
      const won = p.userId === winnerId;
      return User.findByIdAndUpdate(p.userId, {
        rating: newRatings[p.userId],
        $inc: {
          wins: won ? 1 : 0,
          losses: !isDraw && !won ? 1 : 0,
          totalBattles: 1,
        },
      });
    })
  );

  if (room.matchId) {
    await Match.findByIdAndUpdate(room.matchId, {
      status: 'completed',
      winner: winnerId,
      isDraw,
      endedAt: new Date(),
      players: room.players.map((p) => ({
        user: p.userId,
        language: room.results[p.userId]?.language ?? null,
        verdict: room.results[p.userId]?.verdict ?? null,
        passedCount: room.results[p.userId]?.passedCount ?? 0,
        totalCount: room.results[p.userId]?.totalCount ?? 0,
        submittedAt: room.results[p.userId]?.submittedAt ?? null,
        ratingBefore: p.rating,
        ratingAfter: newRatings[p.userId],
      })),
    });
    await saveReplay(room);
    await ActiveRoom.deleteOne({ roomCode });
  }

  const payload = {
    roomCode,
    matchId: room.matchId,
    winner: winnerId,
    isDraw,
    results: room.players.map((p) => ({
      userId: p.userId,
      username: p.username,
      ...room.results[p.userId],
      ratingBefore: p.rating,
      ratingAfter: newRatings[p.userId],
    })),
  };
  getIO().to(roomCode).to(watchChannel(roomCode)).emit('battle:end', payload);

  // Keep the room around briefly so late-arriving events, reconnects and
  // rematch requests during the result screen still resolve, then free it.
  setTimeout(() => {
    if (rooms.get(roomCode) === room) rooms.delete(roomCode);
  }, COMPLETED_ROOM_TTL_MS);
}

// --- Rematch ---

export function requestRematch(socket, { roomCode } = {}) {
  const room = rooms.get(roomCode);
  const userId = socket.user._id.toString();
  if (!room || room.status !== 'completed' || !room.players.some((p) => p.userId === userId)) {
    return socket.emit('rematch:unavailable', { message: 'This battle can no longer be rematched.' });
  }
  const opponent = room.players.find((p) => p.userId !== userId);
  if (!opponent || !socketById(opponent.socketId)) {
    return socket.emit('rematch:unavailable', { message: `${opponent?.username ?? 'Your opponent'} has left.` });
  }
  if (findRoomByUserId(opponent.userId)) {
    return socket.emit('rematch:unavailable', { message: `${opponent.username} is already in another battle.` });
  }
  room.rematch = { from: userId, at: Date.now() };
  emitToPlayer(opponent, 'rematch:requested', { roomCode, from: socket.user.username });
  socket.emit('rematch:pending', { roomCode });
}

export async function acceptRematch(socket, { roomCode } = {}) {
  const room = rooms.get(roomCode);
  const userId = socket.user._id.toString();
  const valid =
    room?.status === 'completed' &&
    room.rematch &&
    room.rematch.from !== userId &&
    Date.now() - room.rematch.at < REMATCH_WINDOW_MS &&
    room.players.some((p) => p.userId === userId);
  if (!valid) {
    return socket.emit('rematch:unavailable', { message: 'The rematch offer has expired.' });
  }
  room.rematch = null;

  // Fresh ratings: the battle that just ended changed them.
  const users = await User.find({ _id: { $in: room.players.map((p) => p.userId) } }).select('rating');
  const ratingOf = Object.fromEntries(users.map((u) => [u._id.toString(), u.rating]));
  const [a, b] = room.players.map((p) => ({
    userId: p.userId,
    socketId: p.userId === userId ? socket.id : p.socketId,
    username: p.username,
    rating: ratingOf[p.userId] ?? p.rating,
  }));
  if (findRoomByUserId(a.userId) || findRoomByUserId(b.userId)) {
    return socket.emit('rematch:unavailable', { message: 'One of you is already in another battle.' });
  }
  startRoomWith(a, b, 'rematch:start');
}

export function declineRematch(socket, { roomCode } = {}) {
  const room = rooms.get(roomCode);
  if (!room?.rematch) return;
  const requester = room.players.find((p) => p.userId === room.rematch.from);
  room.rematch = null;
  emitToPlayer(requester, 'rematch:declined', { roomCode, by: socket.user.username });
}

// --- Chat & typing ---

export function sendChatMessage(socket, roomCode, message) {
  const room = rooms.get(roomCode);
  if (!room) return;
  if (!room.players.some((p) => p.userId === socket.user._id.toString())) return;
  const text = String(message ?? '').trim().slice(0, 500);
  if (!text) return;

  getIO()
    .to(roomCode)
    .to(watchChannel(roomCode))
    .emit('chat:message', { username: socket.user.username, message: text, timestamp: Date.now() });
}

export function broadcastTyping(socket, roomCode) {
  const room = rooms.get(roomCode);
  if (!room) return;
  const userId = socket.user._id.toString();
  if (!room.players.some((p) => p.userId === userId)) return;
  socket.to(roomCode).emit('battle:opponentTyping');
  getIO().to(watchChannel(roomCode)).emit('battle:typing', { userId });
}

// --- Spectators ---

export function listLiveBattles() {
  const io = getIO();
  return [...rooms.values()]
    .filter((r) => r.status === 'in_progress')
    .map((r) => ({
      roomCode: r.roomCode,
      players: r.players.map((p) => ({ username: p.username, rating: p.rating })),
      problem: { title: r.problem.title, difficulty: r.problem.difficulty },
      remainingMs: remainingMs(r),
      spectators: io?.sockets.adapter.rooms.get(watchChannel(r.roomCode))?.size ?? 0,
    }))
    .sort((a, b) => b.remainingMs - a.remainingMs);
}

export function joinSpectators(socket, { roomCode } = {}) {
  const room = rooms.get(roomCode);
  if (!room || room.status === 'completed' || room.status === 'waiting') {
    return socket.emit('spectate:error', { message: 'This battle is not live.' });
  }
  if (room.players.some((p) => p.userId === socket.user._id.toString())) {
    return socket.emit('spectate:error', { message: 'You are playing in this battle.' });
  }
  socket.join(watchChannel(roomCode));
  socket.emit('spectate:state', spectatorState(room));
}

export function leaveSpectators(socket, { roomCode } = {}) {
  if (roomCode) socket.leave(watchChannel(roomCode));
}

// --- Several tabs, disconnects and reconnects ---

// Makes this socket the player's active connection for their battle. The
// previous tab is told it was taken over (and can claim it back).
function takeOver(room, player, socket) {
  const previous = player.socketId;
  if (previous && previous !== socket.id) {
    const old = socketById(previous);
    if (old) {
      old.leave(room.roomCode);
      old.emit('battle:takenOver', { roomCode: room.roomCode });
    }
  }
  player.socketId = socket.id;
  socket.join(room.roomCode);

  if (room.disconnectTimers[player.userId]) {
    clearTimeout(room.disconnectTimers[player.userId]);
    delete room.disconnectTimers[player.userId];
    const opponent = room.players.find((p) => p.userId !== player.userId);
    emitToPlayer(opponent, 'battle:opponentReconnected');
  }
}

function resumePayload(room) {
  return {
    roomCode: room.roomCode,
    problem: room.problem,
    durationMs: room.durationMs,
    remainingMs: remainingMs(room),
    players: room.players.map(toPublicPlayer),
    progress: publicResults(room),
  };
}

// Sent by the battle page when it opens, and by "Use this tab" after a
// takeover: this tab becomes the player's active one for the battle.
// Silently ignored for non-players (e.g. a room link opened by someone
// about to join), so it never races room:join.
export function claimBattle(socket, roomCode) {
  const room = rooms.get(roomCode);
  if (!room || room.status === 'completed') {
    return socket.emit('room:error', { message: 'This battle has ended or does not exist.' });
  }
  const player = room.players.find((p) => p.userId === socket.user._id.toString());
  if (!player) return;
  takeOver(room, player, socket);
  if (room.status === 'in_progress') socket.emit('battle:resume', resumePayload(room));
  else broadcastRoomState(roomCode);
}

export function handleDisconnect(socket) {
  leaveQueue(socket);

  const userId = socket.user?._id?.toString();
  if (!userId) return;

  const room = findRoomByUserId(userId);
  if (!room) return;
  const player = room.players.find((p) => p.userId === userId);
  // Another tab is the active one - closing this one changes nothing.
  if (player.socketId !== socket.id) return;
  player.socketId = null;

  if (room.status === 'waiting' || room.status === 'countdown') {
    // No battle in progress yet - just drop them from the room.
    room.players = room.players.filter((p) => p.userId !== userId);
    clearInterval(room.countdownInterval);
    if (room.status === 'countdown') {
      room.status = 'waiting';
      room.players.forEach((p) => (p.ready = false));
    }
    if (room.players.length === 0) rooms.delete(room.roomCode);
    else broadcastRoomState(room.roomCode);
    return;
  }

  if (room.status === 'in_progress') {
    const opponent = room.players.find((p) => p.userId !== userId);
    emitToPlayer(opponent, 'battle:opponentDisconnected', { graceMs: DISCONNECT_GRACE_MS });

    room.disconnectTimers[userId] = setTimeout(() => {
      // Both gone (e.g. both closed the tab): let the clock decide instead.
      if (opponent?.socketId) endBattle(room.roomCode, { forcedWinnerId: opponent.userId });
    }, DISCONNECT_GRACE_MS);
  }
}

// Called on a fresh connection. If this user has a room and no other live
// connection for it (they refreshed, lost the network, or the server
// restarted), this socket takes over and the battle resumes. If another
// tab is still connected, nothing changes here - opening the dashboard in
// a new tab must not steal the battle; the battle page claims explicitly.
export function handleReconnect(socket) {
  const userId = socket.user._id.toString();
  const room = findRoomByUserId(userId);
  if (!room) return null;

  const player = room.players.find((p) => p.userId === userId);
  if (player.socketId && player.socketId !== socket.id && socketById(player.socketId)) return null;
  takeOver(room, player, socket);
  return room.status === 'in_progress' ? resumePayload(room) : null;
}
