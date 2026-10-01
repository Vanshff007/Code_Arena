// In-memory only, by design - a room only becomes a persisted Match
// document once the battle actually starts (see roomManager.startBattle).
// This assumes a single Node process; scaling to multiple instances would
// move this to Redis, but that's out of scope for this project.

// Random-matchmaking queue: [{ socketId, userId, username, rating }]
export const matchmakingQueue = [];

// roomCode -> RoomState
export const rooms = new Map();

export function createRoomState(roomCode, hostPlayer) {
  const room = {
    roomCode,
    players: [hostPlayer], // { userId, socketId, username, rating, ready }
    status: 'waiting', // waiting -> countdown -> in_progress -> completed
    problem: null,
    matchId: null,
    startedAt: null,
    durationMs: 15 * 60 * 1000, // 15 minutes per battle
    timerInterval: null,
    countdownInterval: null,
    disconnectTimers: {}, // userId -> setTimeout handle (forfeit grace period)
    results: {}, // userId -> { verdict, passedCount, totalCount, submittedAt }
  };
  rooms.set(roomCode, room);
  return room;
}

// Completed rooms stay in `rooms` for a minute after the battle (see
// roomManager.endBattle) but no longer count as the player's room -
// otherwise "Find another match" on the result screen is rejected with
// "already in a battle" until the old room is cleaned up.
export function findRoomByUserId(userId) {
  for (const room of rooms.values()) {
    if (room.status === 'completed') continue;
    if (room.players.some((p) => p.userId === userId)) return room;
  }
  return null;
}
