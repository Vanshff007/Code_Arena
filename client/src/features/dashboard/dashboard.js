// Pure helpers for the dashboard (covered by dashboard.test.js).

export function winRate({ wins = 0, totalBattles = 0 } = {}) {
  return totalBattles > 0 ? Math.round((wins / totalBattles) * 100) : 0;
}

// `random` is injectable so tests can make the pick deterministic.
export function pickRandom(items = [], random = Math.random) {
  if (items.length === 0) return null;
  return items[Math.floor(random() * items.length)];
}
