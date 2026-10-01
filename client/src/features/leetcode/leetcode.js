// Mirrors server/features/leetcode/leetcode.validator.js.
export function isValidLeetCodeUsername(name = '') {
  return name.length >= 1 && name.length <= 40 && /^[a-zA-Z0-9_-]+$/.test(name);
}

// Maps a failed recommendations request to what the panel shows: a prompt
// to connect (400 from the server) or an error message (LeetCode down).
export function recommendationState(err) {
  if (err?.response?.status === 400) return { status: 'not-connected' };
  return {
    status: 'error',
    message: err?.response?.data?.message || 'Could not load LeetCode suggestions. Try again later.',
  };
}

// Points for a small rating line chart: oldest on the left, newest on the
// right, the y range fitted to the ratings with a little padding.
export function ratingChart(ratings, width, height, pad = 4) {
  if (!ratings.length) return { points: '', last: null };
  const min = Math.min(...ratings);
  const max = Math.max(...ratings);
  const span = max - min || 1;
  const step = ratings.length > 1 ? (width - 2 * pad) / (ratings.length - 1) : 0;
  const pts = ratings.map((r, i) => ({
    x: ratings.length > 1 ? pad + i * step : width / 2,
    y: height - pad - ((r - min) / span) * (height - 2 * pad),
  }));
  return { points: pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' '), last: pts.at(-1) };
}

export function barPercent(value, max) {
  if (!max) return 0;
  return Math.max(2, Math.round((value / max) * 100));
}
