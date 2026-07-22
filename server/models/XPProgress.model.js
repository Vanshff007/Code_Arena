import mongoose from 'mongoose';

// One document per (user, topic) pair - topic XP and level, kept separate
// from the overall battle rating (User.rating) since they measure
// different things: rating is competitive standing, topic XP is learning
// progress. Level itself is derived from xp (see services/xp.service.js)
// and recomputed on read rather than stored, so the leveling curve can
// change without a data migration.
const xpProgressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    topic: { type: String, required: true },
    xp: { type: Number, default: 0 },
  },
  { timestamps: true }
);

xpProgressSchema.index({ user: 1, topic: 1 }, { unique: true });

const XPProgress = mongoose.model('XPProgress', xpProgressSchema);

export default XPProgress;
