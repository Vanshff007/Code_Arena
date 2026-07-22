import { randomInt } from 'crypto';
import Problem from '../models/Problem.model.js';
import Match from '../models/Match.model.js';
import User from '../models/User.model.js';
import { calculateRatings } from '../services/ratingService.js';
import { getIO } from './ioInstance.js';
import { matchmakingQueue, rooms, createRoomState, findRoomByUserId } from './state.js';
import logger from '../utils/logger.js';

const DISCONNECT_GRACE_MS = 20 * 1000; // time an opponent has to reconnect before auto-forfeit

function generateRoomCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I - easy to read aloud/type
  let code = '';
  for (let i = 0; i < 6; i++) code += alphabet[randomInt(alphabet.length)];
  return code;
}

// Uses a random skip offset rather than $sample so the query goes through
// Mongoose's normal find path - hiddenTestCases (select: false on the
// schema) stays excluded. An aggregation $sample would bypass that
// projection entirely and could leak hidden test cases into battle:start.
async function pickRandomProblem() {
  const count = await Problem.countDocuments();
  if (count === 0) throw new Error('No problems available to start a battle');
  const problem = await Problem.findOne().skip(randomInt(count));
  return problem;
}

function toPublicPlayer(player) {
  return { userId: player.userId, username: player.username, rating: player.rating, ready: !!player.ready };
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

// --- Private rooms (Create Room / Join Room / Invite Friends) ---

export function createRoom(socket) {
  const existing = findRoomByUserId(socket.user._id.toString());
  if (existing) {
    return socket.emit('room:error', { message: 'You are already in a room' });
  }

  const roomCode = generateRoomCode();
  const hostPlayer = {
    userId: socket.user._id.toString(),
    socketId: socket.id,
    username: socket.user.username,
    rating: socket.user.rating,
    ready: false,
  };
  createRoomState(roomCode, hostPlayer);

  socket.join(roomCode);
  socket.emit('room:created', { roomCode });
  broadcastRoomState(roomCode);
}

export function joinRoom(socket, roomCode) {
  const room = rooms.get(roomCode);
  if (!room) {
    return socket.emit('room:error', { message: 'Room not found' });
  }
  if (room.players.length >= 2) {
    return socket.emit('room:error', { message: 'Room is already full' });
  }
  if (room.players.some((p) => p.userId === socket.user._id.toString())) {
    return socket.emit('room:error', { message: 'You are already in this room' });
  }

  room.players.push({
    userId: socket.user._id.toString(),
    socketId: socket.id,
    username: socket.user.username,
    rating: socket.user.rating,
    ready: false,
  });

  socket.join(roomCode);
  broadcastRoomState(roomCode);
}

export function setReady(socket, roomCode) {
  const room = rooms.get(roomCode);
  if (!room) return socket.emit('room:error', { message: 'Room not found' });

  const player = room.players.find((p) => p.userId === socket.user._id.toString());
  if (!player) return socket.emit('room:error', { message: 'You are not in this room' });

  player.ready = true;
  broadcastRoomState(roomCode);

  if (room.players.length === 2 && room.players.every((p) => p.ready)) {
    startCountdown(roomCode);
  }
}

// --- Random matchmaking ---

export function joinQueue(socket) {
  if (findRoomByUserId(socket.user._id.toString())) {
    return socket.emit('room:error', { message: 'You are already in a battle' });
  }
  if (matchmakingQueue.some((q) => q.userId === socket.user._id.toString())) return;

  matchmakingQueue.push({
    socketId: socket.id,
    userId: socket.user._id.toString(),
    username: socket.user.username,
    rating: socket.user.rating,
  });
  socket.emit('matchmaking:waiting');

  if (matchmakingQueue.length >= 2) {
    const [a, b] = matchmakingQueue.splice(0, 2);
    const roomCode = generateRoomCode();
    const room = createRoomState(roomCode, { ...a, ready: true });
    room.players.push({ ...b, ready: true });

    const io = getIO();
    io.sockets.sockets.get(a.socketId)?.join(roomCode);
    io.sockets.sockets.get(b.socketId)?.join(roomCode);
    io.to(roomCode).emit('matchmaking:found', { roomCode });

    startCountdown(roomCode);
  }
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
  if (!room) return;

  try {
    const problem = await pickRandomProblem();

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
      room.results[p.userId] = { verdict: null, passedCount: 0, totalCount: 0, submittedAt: null };
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

    room.timerInterval = setInterval(() => {
      const remainingMs = room.durationMs - (Date.now() - room.startedAt);
      if (remainingMs <= 0) {
        clearInterval(room.timerInterval);
        endBattle(roomCode, { reason: 'timeout' });
      } else {
        io.to(roomCode).emit('battle:timerSync', { remainingMs });
      }
    }, 1000);
  } catch (err) {
    logger.error(`Failed to start battle for room ${roomCode}: ${err.message}`);
    getIO().to(roomCode).emit('room:error', { message: 'Could not start the battle. Please try again.' });
  }
}

// Called by the REST /api/execute/submit controller after judging a
// submission made during a battle - bridges the HTTP judging flow into the
// real-time room state. Never receives or forwards hidden test case
// content, only the aggregate verdict.
export async function handleBattleSubmission(roomCode, userId, result) {
  const room = rooms.get(roomCode);
  if (!room || room.status !== 'in_progress') return;

  const existing = room.results[userId];
  // Keep the player's best attempt (highest passedCount) for the
  // timer-expiry tie-break, not just their most recent submission.
  if (!existing || result.passedCount >= existing.passedCount) {
    room.results[userId] = {
      verdict: result.verdict,
      passedCount: result.passedCount,
      totalCount: result.totalCount,
      submittedAt: new Date(),
    };
  }

  const opponent = room.players.find((p) => p.userId !== userId);
  if (opponent) {
    getIO().to(opponent.socketId).emit('battle:opponentSubmitted', {
      verdict: result.verdict,
      passedCount: result.passedCount,
      totalCount: result.totalCount,
    });
  }

  if (result.verdict === 'Accepted') {
    clearInterval(room.timerInterval);
    await endBattle(roomCode, { forcedWinnerId: userId, reason: 'accepted' });
  }
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
        language: null,
        verdict: room.results[p.userId]?.verdict ?? null,
        passedCount: room.results[p.userId]?.passedCount ?? 0,
        totalCount: room.results[p.userId]?.totalCount ?? 0,
        submittedAt: room.results[p.userId]?.submittedAt ?? null,
        ratingBefore: p.rating,
        ratingAfter: newRatings[p.userId],
      })),
    });
  }

  getIO()
    .to(roomCode)
    .emit('battle:end', {
      winner: winnerId,
      isDraw,
      results: room.players.map((p) => ({
        userId: p.userId,
        username: p.username,
        ...room.results[p.userId],
        ratingBefore: p.rating,
        ratingAfter: newRatings[p.userId],
      })),
    });

  // Keep the room around briefly so late-arriving events/reconnects during
  // the result screen still resolve, then free it.
  setTimeout(() => rooms.delete(roomCode), 60 * 1000);
}

// --- Chat & presence ---

export function sendChatMessage(socket, roomCode, message) {
  const room = rooms.get(roomCode);
  if (!room) return;
  if (!room.players.some((p) => p.userId === socket.user._id.toString())) return;

  getIO().to(roomCode).emit('chat:message', {
    username: socket.user.username,
    message: String(message).slice(0, 500),
    timestamp: Date.now(),
  });
}

export function broadcastTyping(socket, roomCode) {
  const room = rooms.get(roomCode);
  if (!room) return;
  socket.to(roomCode).emit('battle:opponentTyping');
}

// --- Disconnect / forfeit handling ---

export function handleDisconnect(socket) {
  leaveQueue(socket);

  const userId = socket.user?._id?.toString();
  if (!userId) return;

  const room = findRoomByUserId(userId);
  if (!room) return;

  if (room.status === 'waiting' || room.status === 'countdown') {
    // No battle in progress yet - just drop them from the room.
    room.players = room.players.filter((p) => p.userId !== userId);
    clearInterval(room.countdownInterval);
    if (room.players.length === 0) rooms.delete(room.roomCode);
    else broadcastRoomState(room.roomCode);
    return;
  }

  if (room.status === 'in_progress') {
    const opponent = room.players.find((p) => p.userId !== userId);
    if (opponent) {
      getIO().to(opponent.socketId).emit('battle:opponentDisconnected', { graceMs: DISCONNECT_GRACE_MS });
    }

    room.disconnectTimers[userId] = setTimeout(() => {
      if (opponent) endBattle(room.roomCode, { forcedWinnerId: opponent.userId });
    }, DISCONNECT_GRACE_MS);
  }
}

// Called on a fresh connection - if this user has an in-progress battle
// (e.g. they refreshed the page), rejoin them to it instead of leaving them
// stranded on a disconnect timer.
export function handleReconnect(socket) {
  const userId = socket.user._id.toString();
  const room = findRoomByUserId(userId);
  if (!room) return null;

  const player = room.players.find((p) => p.userId === userId);
  player.socketId = socket.id;
  socket.join(room.roomCode);

  if (room.disconnectTimers[userId]) {
    clearTimeout(room.disconnectTimers[userId]);
    delete room.disconnectTimers[userId];
    const opponent = room.players.find((p) => p.userId !== userId);
    if (opponent) getIO().to(opponent.socketId).emit('battle:opponentReconnected');
  }

  if (room.status !== 'in_progress') return null;

  const remainingMs = room.durationMs - (Date.now() - room.startedAt);
  return {
    roomCode: room.roomCode,
    problem: room.problem,
    durationMs: room.durationMs,
    remainingMs,
    players: room.players.map(toPublicPlayer),
  };
}
