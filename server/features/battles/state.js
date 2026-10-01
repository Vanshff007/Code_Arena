// In-memory battle state - the source of truth while the process runs.
// In-progress battles are also copied to Mongo (ActiveRoom) so they survive
// a restart; see roomManager.persistRoom / restoreActiveBattles. This still
// assumes a single Node process; several instances would need shared state
// (e.g. Redis) and cross-instance socket delivery.

// Random-matchmaking queue: [{ socketId, userId, username, rating }]
export const matchmakingQueue = [];

// roomCode -> RoomState
export const rooms = new Map();

export const BATTLE_DURATION_MS = 15 * 60 * 1000;

export function createRoomState(roomCode, hostPlayer) {
  const room = {
    roomCode,
    players: [hostPlayer], // { userId, socketId, username, rating, ready }
    status: 'waiting', // waiting -> countdown -> in_progress -> completed
    problem: null,
    matchId: null,
    startedAt: null,
    durationMs: BATTLE_DURATION_MS,
    timerInterval: null,
    countdownInterval: null,
    disconnectTimers: {}, // userId -> setTimeout handle (forfeit grace period)
    results: {}, // userId -> { verdict, passedCount, totalCount, submittedAt, language }
    snapshots: {}, // userId -> [{ t, code, language }] for the replay
    timeline: [], // [{ t, userId, verdict, passedCount, totalCount, language }]
    rematch: null, // { from: userId, at } after the battle ends
    lastPersistAt: 0,
  };
  rooms.set(roomCode, room);
  return room;
}

// Completed rooms stay in `rooms` for a minute after the battle (for late
// events and rematch requests) but no longer count as the player's room -
// otherwise "Find another match" on the result screen is rejected with
// "already in a battle" until the old room is cleaned up.
export function findRoomByUserId(userId) {
  for (const room of rooms.values()) {
    if (room.status === 'completed') continue;
    if (room.players.some((p) => p.userId === userId)) return room;
  }
  return null;
}

// Problem difficulty for a battle, from the players' average rating. New
// players (1000) get Easy problems; Hard needs both to be strong.
export function difficultyForRatings(ratings) {
  if (!ratings.length) return 'Easy';
  const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
  if (avg < 1150) return 'Easy';
  if (avg < 1450) return 'Medium';
  return 'Hard';
}

export const MAX_SNAPSHOT_CHARS = 20_000;
export const MAX_SNAPSHOTS_PER_PLAYER = 400;

// Adds a code snapshot unless nothing changed. Over the cap, the last entry
// is overwritten so the newest code is never lost. Returns true if stored.
export function addSnapshot(list, snapshot) {
  const last = list.at(-1);
  if (last && last.code === snapshot.code && last.language === snapshot.language) return false;
  const entry = { ...snapshot, code: String(snapshot.code ?? '').slice(0, MAX_SNAPSHOT_CHARS) };
  if (list.length >= MAX_SNAPSHOTS_PER_PLAYER) list[list.length - 1] = entry;
  else list.push(entry);
  return true;
}
