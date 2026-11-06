// Ranked tier for a rating. Display only: the server never stores tiers.
// New players start at 1000 (Bronze).
export const TIERS = [
  { name: 'Diamond', min: 1700 },
  { name: 'Platinum', min: 1500 },
  { name: 'Gold', min: 1300 },
  { name: 'Silver', min: 1100 },
  { name: 'Bronze', min: -Infinity },
];

export function tierFor(rating) {
  return TIERS.find((t) => (Number(rating) || 0) >= t.min).name;
}
