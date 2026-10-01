// Pure helpers for the skill profile (covered by skills.test.js).
// Thresholds match server/features/skills/recommendation.service.js.
export const WEAK_BELOW = 40;
export const STRONG_ABOVE = 75;

// [topic, score] pairs sorted weakest first.
export function weakTopics(topicScores = {}) {
  return Object.entries(topicScores)
    .filter(([, score]) => score < WEAK_BELOW)
    .sort((a, b) => a[1] - b[1]);
}

export function strongTopics(topicScores = {}) {
  return Object.entries(topicScores)
    .filter(([, score]) => score > STRONG_ABOVE)
    .sort((a, b) => b[1] - a[1]);
}

export function xpPercent({ xpIntoLevel = 0, xpForNextLevel = 0 } = {}) {
  if (!xpForNextLevel) return 0;
  return Math.min(100, Math.round((xpIntoLevel / xpForNextLevel) * 100));
}
