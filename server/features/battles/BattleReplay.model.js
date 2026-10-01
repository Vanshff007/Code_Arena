import mongoose from 'mongoose';

// How a battle unfolded: each player's code over time and every submission.
// Saved when the battle ends; only the two players can open it (see
// match.controller.getReplay). Kept apart from Match so match lists stay
// small.
const snapshotSchema = new mongoose.Schema(
  {
    t: { type: Number, required: true }, // ms since the battle started
    code: { type: String, default: '' },
    language: { type: String, required: true },
  },
  { _id: false }
);

const battleReplaySchema = new mongoose.Schema(
  {
    match: { type: mongoose.Schema.Types.ObjectId, ref: 'Match', required: true, unique: true },
    problem: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
    durationMs: { type: Number, required: true },
    players: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        username: { type: String, required: true },
        snapshots: { type: [snapshotSchema], default: [] },
        _id: false,
      },
    ],
    timeline: [
      {
        t: Number,
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        verdict: String,
        passedCount: Number,
        totalCount: Number,
        language: String,
        _id: false,
      },
    ],
  },
  { timestamps: true }
);

const BattleReplay = mongoose.model('BattleReplay', battleReplaySchema);

export default BattleReplay;
