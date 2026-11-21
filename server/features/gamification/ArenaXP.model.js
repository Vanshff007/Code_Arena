import mongoose from 'mongoose';

// One ledger entry per player per finished battle. Arena XP counts from
// launch (no backfill). The unique index makes a repeated award a no-op.
const arenaXpSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    match: { type: mongoose.Schema.Types.ObjectId, ref: 'Match', required: true },
    xp: { type: Number, required: true },
    items: [{ _id: false, key: String, label: String, xp: Number }],
  },
  { timestamps: true }
);

arenaXpSchema.index({ user: 1, match: 1 }, { unique: true });

const ArenaXP = mongoose.model('ArenaXP', arenaXpSchema);

export default ArenaXP;
