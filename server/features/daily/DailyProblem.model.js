import mongoose from 'mongoose';

// The problem of the day. One document per UTC day, created on the first
// request that day, so the pick stays fixed even if the bank changes.
const dailyProblemSchema = new mongoose.Schema(
  {
    date: { type: String, required: true, unique: true }, // 'YYYY-MM-DD', UTC
    problem: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
  },
  { timestamps: true }
);

const DailyProblem = mongoose.model('DailyProblem', dailyProblemSchema);

export default DailyProblem;
