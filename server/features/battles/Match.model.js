import mongoose from 'mongoose';

const playerResultSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    language: { type: String, default: null },
    verdict: { type: String, default: null }, // null until they submit at least once
    passedCount: { type: Number, default: 0 },
    totalCount: { type: Number, default: 0 },
    submittedAt: { type: Date, default: null },
    ratingBefore: { type: Number, required: true },
    ratingAfter: { type: Number, default: null }, // filled in once the match ends
  },
  { _id: false }
);

const matchSchema = new mongoose.Schema(
  {
    problem: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
    players: {
      type: [playerResultSchema],
      validate: { validator: (arr) => arr.length === 2, message: 'A match requires exactly 2 players' },
    },
    status: {
      type: String,
      enum: ['in_progress', 'completed', 'aborted'],
      default: 'in_progress',
    },
    winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // null = draw or aborted
    isDraw: { type: Boolean, default: false },
    durationMs: { type: Number, required: true },
    startedAt: { type: Date, required: true },
    endedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const Match = mongoose.model('Match', matchSchema);

export default Match;
