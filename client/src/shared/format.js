// Small display helpers shared by several features. Pure, so they are
// covered by shared.test.js.

// +16 / -12 / 0 - rating changes always show their sign.
export function formatSigned(n) {
  const value = Number(n) || 0;
  return value > 0 ? `+${value}` : String(value);
}

// 1482 -> "1,482"
export function formatNumber(n) {
  return (Number(n) || 0).toLocaleString('en-US');
}

// Milliseconds -> "m:ss" for clocks. Never negative.
export function formatClock(ms) {
  const totalSeconds = Math.max(0, Math.ceil((Number(ms) || 0) / 1000));
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

// "12 Sep 2026"
export function formatDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
