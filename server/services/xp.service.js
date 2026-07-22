// Topic leveling - reusable across the app (profile, dashboard, matchmaking
// analytics) rather than duplicated wherever XP needs to be shown. Level is
// derived from total xp on read, not stored, so the curve can be retuned
// without a data migration.
const BASE_XP_PER_LEVEL = 100;
const GROWTH_RATE = 1.15; // each level costs ~15% more xp than the last

// Total xp required to REACH `level` starting from level 1 (0 xp).
export function xpForLevel(level) {
  let total = 0;
  for (let l = 1; l < level; l += 1) {
    total += Math.round(BASE_XP_PER_LEVEL * GROWTH_RATE ** (l - 1));
  }
  return total;
}

export function levelForXp(xp) {
  let level = 1;
  while (xpForLevel(level + 1) <= xp) level += 1;
  return level;
}

// Everything the frontend needs to render a level + progress bar in one call.
export function xpProgressWithinLevel(xp) {
  const level = levelForXp(xp);
  const currentLevelXp = xpForLevel(level);
  const nextLevelXp = xpForLevel(level + 1);
  return {
    level,
    xp,
    xpIntoLevel: xp - currentLevelXp,
    xpForNextLevel: nextLevelXp - currentLevelXp,
  };
}

// XP earned per accepted submission scales with the dynamic score from
// scoring.service.js, so a well-executed hard solve earns much more than a
// lucky easy one - not a flat "+10xp per solve".
export function xpFromScore(score) {
  return Math.round(score * 0.5);
}
