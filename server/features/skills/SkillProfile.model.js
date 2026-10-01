import mongoose from 'mongoose';

// One document per user. topicScores is a Map rather than one field per
// topic - the canonical topic list (constants/topics.js) can grow without
// a schema migration, and unscored topics just don't have a key yet.
const skillProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    topicScores: {
      type: Map,
      of: { type: Number, min: 0, max: 100 },
      default: {},
    },
    lastUpdatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const SkillProfile = mongoose.model('SkillProfile', skillProfileSchema);

export default SkillProfile;
