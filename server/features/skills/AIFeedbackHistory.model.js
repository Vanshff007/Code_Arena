import mongoose from 'mongoose';

// One document per judged submission that produced coaching feedback -
// lets the frontend show a feedback feed and lets the AI Coach reference
// what it already told the user in the past if needed.
const aiFeedbackHistorySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    problem: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
    submissionResultRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PerformanceHistory',
      required: true,
    },
    messages: [{ type: String }],
    recommendedNext: [{ type: String }],
  },
  { timestamps: true }
);

const AIFeedbackHistory = mongoose.model('AIFeedbackHistory', aiFeedbackHistorySchema);

export default AIFeedbackHistory;
