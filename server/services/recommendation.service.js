import Problem from '../models/Problem.model.js';
import RecommendationHistory from '../models/RecommendationHistory.model.js';
import { CONCEPT_PROGRESSION } from '../constants/topics.js';

// Concept-based recommendation engine. It never references a specific
// problem ID (LeetCode's or otherwise) - it decides which CONCEPTS to
// recommend from a skill profile, then asks a "problem source" to find
// matching problems. Today the only problem source is CodeArena's own
// Problem collection (keeping this out of "LeetCode clone" territory); a
// different bank could be plugged in later by implementing the same
// findProblemsByTopics(topics, options) shape and swapping it in below.
async function findProblemsByTopics(topics, { excludeIds = [], limit = 10 } = {}) {
  return Problem.find({
    tags: { $in: topics.map((t) => t.toLowerCase()) },
    _id: { $nin: excludeIds },
  })
    .select('title difficulty tags')
    .limit(limit);
}

// Given a skill profile (topic -> 0-100 score), decides which concepts to
// recommend next:
// - Weak topics (score < 40): recommend that topic's prerequisite/adjacent
//   concepts (e.g. weak in Graphs -> BFS, DFS, Shortest Path, Union Find).
// - Strong topics (score > 75): recommend the topic's advanced progression
//   (e.g. strong in Trees -> Binary Lifting, Euler Tour, LCA).
// Topics with no entry in CONCEPT_PROGRESSION are skipped rather than
// guessed at.
export function pickConceptsToRecommend(topicScores) {
  const weakTopics = [];
  const strongTopics = [];

  for (const [topic, score] of Object.entries(topicScores)) {
    if (score < 40 && CONCEPT_PROGRESSION[topic]) weakTopics.push(topic);
    else if (score > 75 && CONCEPT_PROGRESSION[topic]) strongTopics.push(topic);
  }

  const concepts = new Set();
  for (const topic of [...weakTopics, ...strongTopics]) {
    for (const concept of CONCEPT_PROGRESSION[topic]) concepts.add(concept);
  }

  return { concepts: [...concepts], weakTopics, strongTopics };
}

function toPlainScores(topicScores) {
  return topicScores instanceof Map ? Object.fromEntries(topicScores) : topicScores || {};
}

// Main entry point - returns recommended problems plus a human-readable
// reason, and logs the recommendation for later "did they actually solve
// it" analysis.
export async function getRecommendedProblems(userId, skillProfile, { limit = 10 } = {}) {
  const topicScores = toPlainScores(skillProfile?.topicScores);
  const { concepts, weakTopics, strongTopics } = pickConceptsToRecommend(topicScores);

  let problems;
  let reason;

  if (concepts.length === 0) {
    // No strong signal yet (brand new account) - a spread of Easy problems
    // is a reasonable, honest default rather than fabricating a "skill gap".
    problems = await Problem.find({ difficulty: 'Easy' }).select('title difficulty tags').limit(limit);
    reason = 'Getting started';
  } else {
    problems = await findProblemsByTopics(concepts, { limit });
    reason =
      weakTopics.length > 0
        ? `Strengthening: ${weakTopics.join(', ')}`
        : `Leveling up: ${strongTopics.join(', ')}`;
  }

  // Only log problems not already pending recommendation - otherwise every
  // dashboard visit would re-insert the same rows.
  if (problems.length > 0) {
    const alreadyPending = await RecommendationHistory.find({
      user: userId,
      problem: { $in: problems.map((p) => p._id) },
      solvedAt: null,
    }).distinct('problem');
    const alreadyPendingIds = new Set(alreadyPending.map((id) => id.toString()));
    const freshlyRecommended = problems.filter((p) => !alreadyPendingIds.has(p._id.toString()));

    if (freshlyRecommended.length > 0) {
      await RecommendationHistory.insertMany(
        freshlyRecommended.map((p) => ({
          user: userId,
          problem: p._id,
          topic: concepts[0] || 'General',
          reason,
        }))
      );
    }
  }

  return { problems, reason, concepts };
}
