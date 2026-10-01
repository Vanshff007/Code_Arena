import mongoose from 'mongoose';

// Records what the recommendation engine suggested and why, so
// "recommended -> actually solved" can be measured later and the same
// problem isn't recommended on every single visit.
const recommendationHistorySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    problem: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
    topic: { type: String, required: true },
    reason: { type: String, required: true },
    recommendedAt: { type: Date, default: Date.now },
    solvedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const RecommendationHistory = mongoose.model('RecommendationHistory', recommendationHistorySchema);

export default RecommendationHistory;
