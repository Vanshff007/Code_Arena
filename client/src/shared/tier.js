// Ranked tier for a rating. Display only: the server never stores tiers.
// New players start at 1000 (Bronze).
export const TIERS = [
  { name: 'Diamond', min: 1700 },
  { name: 'Platinum', min: 1500 },
  { name: 'Gold', min: 1300 },
  { name: 'Silver', min: 1100 },
  { name: 'Bronze', min: -Infinity },
];

// Lowest to highest, for ladders.
export const TIER_ORDER = TIERS.map((t) => t.name).reverse();

// Full class names so Tailwind generates them (tokens in index.css).
export const TIER_TEXT = {
  Bronze: 'text-tier-bronze',
  Silver: 'text-tier-silver',
  Gold: 'text-tier-gold',
  Platinum: 'text-tier-platinum',
  Diamond: 'text-tier-diamond',
};
export const TIER_BG = {
  Bronze: 'bg-tier-bronze',
  Silver: 'bg-tier-silver',
  Gold: 'bg-tier-gold',
  Platinum: 'bg-tier-platinum',
  Diamond: 'bg-tier-diamond',
};

export function tierFor(rating) {
  return TIERS.find((t) => (Number(rating) || 0) >= t.min).name;
}

// The next tier up and the rating still needed, or null at Diamond.
export function nextTier(rating) {
  const i = TIER_ORDER.indexOf(tierFor(rating));
  if (i === TIER_ORDER.length - 1) return null;
  const name = TIER_ORDER[i + 1];
  return { name, pointsToGo: TIERS.find((t) => t.name === name).min - (Number(rating) || 0) };
}

// 'up', 'down' or null when a rating change crosses a tier line.
export function tierChange(before, after) {
  const diff = TIER_ORDER.indexOf(tierFor(after)) - TIER_ORDER.indexOf(tierFor(before));
  return diff > 0 ? 'up' : diff < 0 ? 'down' : null;
}
