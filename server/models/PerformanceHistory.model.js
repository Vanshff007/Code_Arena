import mongoose from 'mongoose';

// One document per CodeArena submission (practice or battle) - the
// authoritative, ever-improving signal the Skill Analyzer and AI Coach
// build on, as opposed to the one-time LeetCode sync seed.
const performanceHistorySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    problem: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
    language: { type: String, required: true },
    verdict: { type: String, required: true },
    isAccepted: { type: Boolean, default: false },

    // Wall-clock time from opening the problem to this submission, sent by
    // the client (see execution.controller.js) - null if the client didn't
    // provide a start timestamp.
    timeTakenMs: { type: Number, default: null },
    // How many prior submissions on this same problem were not accepted,
    // captured at write time.
    wrongAttemptsBeforeThis: { type: Number, default: 0 },

    // Both measured directly from the sandboxed run (see
    // services/execution/dockerRunner.js). memoryKb is a best-effort peak
    // reading across the whole judging session (compile + every test case),
    // not perfectly isolated to one test case - documented there.
    runtimeMs: { type: Number, default: null },
    memoryKb: { type: Number, default: null },

    // No hint system or editorial content exists in CodeArena yet (both are
    // listed as future features) - these fields are schema-ready for when
    // that ships, and always default to "none used" until then, which the
    // scoring/AI-coach modifiers treat as neutral.
    hintsUsed: { type: Number, default: 0 },
    editorialViewed: { type: Boolean, default: false },

    // Denormalized from the problem at submission time so analytics
    // queries don't need a populate/join for the common case.
    difficulty: { type: String },
    topics: [{ type: String }],
  },
  { timestamps: true }
);

performanceHistorySchema.index({ user: 1, problem: 1 });
performanceHistorySchema.index({ problem: 1, isAccepted: 1 });

const PerformanceHistory = mongoose.model('PerformanceHistory', performanceHistorySchema);

export default PerformanceHistory;
