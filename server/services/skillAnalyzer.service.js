import User from '../models/User.model.js';
import PerformanceHistory from '../models/PerformanceHistory.model.js';
import SkillProfile from '../models/SkillProfile.model.js';
import { TOPICS } from '../constants/topics.js';

// Independent, reusable module: computes a 0-100 score per topic. Deliberately
// NOT a simple "count solved questions" - see computeTopicScore. Designed to
// be called by matchmaking (fair opponent problem selection), the
// recommendation engine, and profile/analytics views alike, so it has no
// knowledge of any of those callers.

const LEETCODE_SEED_WEIGHT = 0.3;
const CODEARENA_WEIGHT = 0.7;

function clampScore(n) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

// Turns "how many times this topic showed up in recent LeetCode AC
// submissions" into a rough 0-100 seed. Logarithmic so one solve isn't 0
// and twenty solves isn't automatically maxed out - this is a cold-start
// estimate, not a precise measurement (see leetcode.service.js for why).
function seedScoreFromLeetCode(count) {
  if (!count) return 0;
  return clampScore(30 + Math.log2(count + 1) * 20);
}

// Turns CodeArena's own tracked submissions for a topic into a 0-100 score:
// acceptance rate, weighted by how much volume backs it up, so a couple of
// lucky solves doesn't score identically to consistent, repeated success.
function scoreFromPerformance(records) {
  if (records.length === 0) return null; // no data yet - caller falls back to the LeetCode seed alone
  const accepted = records.filter((r) => r.isAccepted).length;
  const acceptRate = accepted / records.length;
  const volumeConfidence = Math.min(1, records.length / 10); // ramps to full confidence at 10 attempts
  return clampScore(acceptRate * 100 * (0.5 + 0.5 * volumeConfidence));
}

// Pure function - no DB access - so it's trivially testable and reusable.
export function computeTopicScore({ leetcodeCount = 0, performanceRecords = [] }) {
  const codeArenaScore = scoreFromPerformance(performanceRecords);
  const leetcodeScore = seedScoreFromLeetCode(leetcodeCount);

  if (codeArenaScore === null) return leetcodeScore;
  return clampScore(codeArenaScore * CODEARENA_WEIGHT + leetcodeScore * LEETCODE_SEED_WEIGHT);
}

// Rebuilds a user's full skill profile from scratch. Called after every
// LeetCode sync and after every accepted CodeArena submission, so scores
// stay current without a separate background job.
export async function recalculateSkillProfile(userId) {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const records = await PerformanceHistory.find({ user: userId }).select('topics isAccepted');

  const scores = {};
  for (const topic of TOPICS) {
    const topicRecords = records.filter((r) => r.topics.includes(topic));
    const leetcodeCount = user.leetcode?.topicCounts?.get(topic) || 0;
    const score = computeTopicScore({ leetcodeCount, performanceRecords: topicRecords });
    if (score > 0) scores[topic] = score;
  }

  const profile = await SkillProfile.findOneAndUpdate(
    { user: userId },
    { topicScores: scores, lastUpdatedAt: new Date() },
    { upsert: true, new: true }
  );
  return profile;
}
