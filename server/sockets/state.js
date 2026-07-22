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

export function findRoomByUserId(userId) {
  for (const room of rooms.values()) {
    if (room.players.some((p) => p.userId === userId)) return room;
  }
  return null;
}
