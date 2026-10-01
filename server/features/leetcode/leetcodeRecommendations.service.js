import { LEETCODE_TAG_MAP } from '../skills/topics.js';
import { fetchProblemsByTag } from './leetcode.service.js';

// Recommends LeetCode problems as links, by topic. Problems are only listed
// (title, difficulty, acceptance rate, link) and solved on leetcode.com -
// LeetCode does not publish test cases, and its problem text is not ours
// to copy, so none of it is imported into CodeArena.

// Canonical topic -> one LeetCode tag slug (first match in the tag map,
// e.g. Trees -> "tree").
const TOPIC_TO_SLUG = {};
for (const [slug, topic] of Object.entries(LEETCODE_TAG_MAP)) {
  if (!TOPIC_TO_SLUG[topic]) TOPIC_TO_SLUG[topic] = slug;
}

const toPlain = (m) => (m instanceof Map ? Object.fromEntries(m) : m || {});

const MAX_TOPICS = 3;
const RECENT_TOPICS = 2; // "what you're working on" slots
const STARTER_TOPICS = ['Arrays', 'Hashing'];

// Topics every interview-style practice plan covers. Used to spot gaps in a
// player's all-time LeetCode history.
const CORE_TOPICS = [
  'Arrays',
  'Hashing',
  'Strings',
  'Two Pointers',
  'Sliding Window',
  'Binary Search',
  'Stack',
  'Linked List',
  'Trees',
  'Heap',
  'Graphs',
  'Greedy',
  'Backtracking',
  'Dynamic Programming',
];

// Which topics to recommend, and why:
// 1. Up to two topics the player has been solving most on LeetCode lately.
// 2. Their weakest topic by skill score, if not already chosen.
// 3. The core topic with the fewest all-time LeetCode solves (a gap).
// 4. Starter topics when there is no signal at all.
export function pickFocusTopics({ topicCounts, topicScores, allTimeTopicCounts } = {}) {
  const counts = toPlain(topicCounts);
  const scores = toPlain(topicScores);
  const allTime = toPlain(allTimeTopicCounts);
  const picked = [];
  const add = (topic, reason) => {
    if (picked.length >= MAX_TOPICS || !TOPIC_TO_SLUG[topic] || picked.some((p) => p.topic === topic)) return;
    picked.push({ topic, slug: TOPIC_TO_SLUG[topic], reason });
  };

  Object.entries(counts)
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, RECENT_TOPICS)
    .forEach(([topic, n]) => add(topic, `You solved ${n} recent LeetCode problem${n === 1 ? '' : 's'} in ${topic}.`));

  const weakest = Object.entries(scores)
    .filter(([topic]) => TOPIC_TO_SLUG[topic])
    .sort((a, b) => a[1] - b[1] || a[0].localeCompare(b[0]))[0];
  if (weakest && weakest[1] < 60) add(weakest[0], `${weakest[0]} is your weakest topic (${weakest[1]}/100).`);

  if (Object.keys(allTime).length > 0) {
    const gap = CORE_TOPICS.filter((t) => !picked.some((p) => p.topic === t))
      .map((t) => [t, allTime[t] ?? 0])
      .sort((a, b) => a[1] - b[1])[0];
    if (gap) {
      add(
        gap[0],
        gap[1] === 0
          ? `You haven't solved any ${gap[0]} problems on LeetCode yet.`
          : `Only ${gap[1]} ${gap[0]} problem${gap[1] === 1 ? '' : 's'} solved on LeetCode so far.`
      );
    }
  }

  if (picked.length === 0) {
    STARTER_TOPICS.forEach((t) => add(t, 'A good place to start.'));
  }
  return picked;
}

// Easier problems for weaker topics, harder ones once a topic is strong.
export function difficultyFor(score) {
  if (score == null || score < 40) return 'EASY';
  if (score <= 75) return 'MEDIUM';
  return 'HARD';
}

// Free problems the player has not solved recently, most-solved first so
// the first suggestions are approachable.
export function selectProblems(questions, solvedSlugs = [], limit = 5) {
  const solved = new Set(solvedSlugs);
  return questions
    .filter((q) => !q.isPaidOnly && !solved.has(q.titleSlug))
    .sort((a, b) => b.acRate - a.acRate)
    .slice(0, limit)
    .map((q) => ({
      title: q.title,
      slug: q.titleSlug,
      difficulty: q.difficulty,
      acceptance: Math.round(q.acRate),
      url: `https://leetcode.com/problems/${q.titleSlug}/`,
    }));
}

// Problem lists change slowly; cache each (tag, difficulty) list so page
// views don't turn into repeated calls to LeetCode. Single process, so an
// in-memory map is enough (see docs/architecture.md).
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const cache = new Map();

export function clearRecommendationCache() {
  cache.clear();
}

async function cachedProblems(slug, difficulty) {
  const key = `${slug}|${difficulty}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.questions;
  const questions = await fetchProblemsByTag(slug, difficulty);
  cache.set(key, { at: Date.now(), questions });
  return questions;
}

export async function getLeetCodeRecommendations({ leetcode, topicScores }, { perTopic = 5 } = {}) {
  const scores = toPlain(topicScores);
  const focus = pickFocusTopics({
    topicCounts: leetcode?.topicCounts,
    topicScores: scores,
    allTimeTopicCounts: leetcode?.allTimeTopicCounts,
  });

  const topics = [];
  for (const f of focus) {
    const difficulty = difficultyFor(scores[f.topic]);
    const questions = await cachedProblems(f.slug, difficulty);
    topics.push({
      topic: f.topic,
      reason: f.reason,
      difficulty: difficulty[0] + difficulty.slice(1).toLowerCase(),
      problems: selectProblems(questions, leetcode?.recentSolvedSlugs, perTopic),
    });
  }
  return topics;
}
