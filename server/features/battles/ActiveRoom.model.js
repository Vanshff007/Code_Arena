import mongoose from 'mongoose';

// A copy of each in-progress battle's state, so a server restart (deploy,
// crash) does not wipe battles. The in-memory room in state.js stays the
// source of truth while the process runs; this is written on battle start,
// on every submission and (throttled) on code snapshots, read once at boot
// by restoreActiveBattles(), and deleted when the battle ends.
// Waiting/countdown rooms are not stored - they are cheap to recreate.
const activeRoomSchema = new mongoose.Schema(
  {
    roomCode: { type: String, required: true, unique: true },
    players: [
      {
        userId: { type: String, required: true },
        username: { type: String, required: true },
        rating: { type: Number, required: true },
        _id: false,
      },
    ],
    problem: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
    matchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Match', required: true },
    startedAt: { type: Date, required: true },
    durationMs: { type: Number, required: true },
    results: { type: mongoose.Schema.Types.Mixed, default: {} },
    snapshots: { type: mongoose.Schema.Types.Mixed, default: {} },
    timeline: { type: mongoose.Schema.Types.Mixed, default: [] },
  },
  { timestamps: true, minimize: false }
);

const ActiveRoom = mongoose.model('ActiveRoom', activeRoomSchema);

export default ActiveRoom;
