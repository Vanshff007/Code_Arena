import PerformanceHistory from '../models/PerformanceHistory.model.js';
import SkillProfile from '../models/SkillProfile.model.js';
import XPProgress from '../models/XPProgress.model.js';
import AIFeedbackHistory from '../models/AIFeedbackHistory.model.js';
import { calculateSubmissionScore } from './scoring.service.js';
import { xpFromScore } from './xp.service.js';
import { recalculateSkillProfile } from './skillAnalyzer.service.js';
import { generateFeedback } from './aiCoach.service.js';
import { normalizeTopicName } from '../constants/topics.js';

// Aggregate stats across all CodeArena users for a problem - used both for
// the dynamic score's "faster/leaner than average" bonuses and for AI Coach
// feedback. Recomputed on demand rather than cached: it's a small indexed
// aggregation and submission volume doesn't justify a cache layer yet.
async function getProblemAverages(problemId) {
  const [agg] = await PerformanceHistory.aggregate([
    { $match: { problem: problemId, isAccepted: true } },
    {
      $group: {
        _id: null,
        avgTimeMs: { $avg: '$timeTakenMs' },
        avgRuntimeMs: { $avg: '$runtimeMs' },
        avgMemoryKb: { $avg: '$memoryKb' },
      },
    },
  ]);
  return agg || { avgTimeMs: null, avgRuntimeMs: null, avgMemoryKb: null };
}

// The single entry point every submission (practice or battle) flows
// through - called from execution.controller.js right after judging. This
// is what makes the learning profile "continuously improve" on every
// submission, not just on LeetCode sync. Errors here must never break the
// actual submit response, so the caller wraps this in its own try/catch.
export async function trackSubmission({
  userId,
  problem,
  language,
  verdict,
  timeTakenMs,
  runtimeMs,
  memoryKb,
}) {
  const isAccepted = verdict === 'Accepted';
  // Problem.tags are always lowercase (schema-enforced); normalize to the
  // canonical taxonomy casing so skillAnalyzer's topic matching actually
  // hits (see constants/topics.js).
  const topics = problem.tags.length > 0 ? problem.tags.map(normalizeTopicName) : ['General'];

  const wrongAttemptsBeforeThis = await PerformanceHistory.countDocuments({
    user: userId,
    problem: problem._id,
    isAccepted: false,
  });

  const record = await PerformanceHistory.create({
    user: userId,
    problem: problem._id,
    language,
    verdict,
    timeTakenMs,
    runtimeMs,
    memoryKb,
    wrongAttemptsBeforeThis,
    difficulty: problem.difficulty,
    topics,
    isAccepted,
  });

  if (!isAccepted) {
    // Still worth recalculating the skill profile - a wrong attempt is
    // signal too (it factors into that topic's acceptance rate).
    await recalculateSkillProfile(userId);
    return { record, score: 0, xpAwarded: [], feedback: null };
  }

  const averages = await getProblemAverages(problem._id);
  const isFirstAttempt = wrongAttemptsBeforeThis === 0;

  const score = calculateSubmissionScore({
    difficulty: problem.difficulty,
    isFirstAttempt,
    timeTakenMs,
    averageTimeMs: averages.avgTimeMs,
    runtimeMs,
    averageRuntimeMs: averages.avgRuntimeMs,
    memoryKb,
    averageMemoryKb: averages.avgMemoryKb,
    wrongAttempts: wrongAttemptsBeforeThis,
    // No hint system or editorial content exists yet - see
    // PerformanceHistory.model.js. Always neutral until one ships.
    hintsUsed: 0,
    editorialViewed: false,
  });

  const xpAwarded = [];
  for (const topic of topics) {
    const gained = xpFromScore(score);
    const progress = await XPProgress.findOneAndUpdate(
      { user: userId, topic },
      { $inc: { xp: gained } },
      { upsert: true, new: true }
    );
    xpAwarded.push({ topic, xpGained: gained, totalXp: progress.xp });
  }

  const skillProfile = await recalculateSkillProfile(userId);

  const primaryTopic = topics[0];
  const topicScore = skillProfile.topicScores.get(primaryTopic) ?? 0;

  const recentStruggles = await PerformanceHistory.find({
    user: userId,
    isAccepted: false,
    createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
  }).select('topics');
  const recentTopicStruggles = [...new Set(recentStruggles.flatMap((r) => r.topics))];

  const { messages, recommendedNext } = generateFeedback({
    verdict,
    timeTakenMs,
    averageTimeMs: averages.avgTimeMs,
    memoryKb,
    averageMemoryKb: averages.avgMemoryKb,
    topic: primaryTopic,
    topicScore,
    recentTopicStruggles,
  });

  const feedback = await AIFeedbackHistory.create({
    user: userId,
    problem: problem._id,
    submissionResultRef: record._id,
    messages,
    recommendedNext,
  });

  return { record, score, xpAwarded, feedback };
}
