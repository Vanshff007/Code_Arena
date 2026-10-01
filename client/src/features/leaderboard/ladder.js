// Pure helpers for the rankings ladder (covered by leaderboard.test.js).

// Bar length for each row: rating relative to the spread on this page, so
// differences are visible even when everyone is between 950 and 1100.
export function ratingBarPercent(rating, rows) {
  if (!rows.length) return 0;
  const ratings = rows.map((r) => r.rating);
  const max = Math.max(...ratings);
  const min = Math.min(...ratings);
  if (max === min) return 100;
  // Keep a 15% floor so the lowest row still shows a bar.
  return Math.round(15 + ((rating - min) / (max - min)) * 85);
}

// How far the player is behind the next rank up, or null if they lead or
// are not on this page.
export function gapToNext(rows, username) {
  const i = rows.findIndex((r) => r.username === username);
  if (i <= 0) return null;
  return { points: rows[i - 1].rating - rows[i].rating, rank: rows[i - 1].rank, username: rows[i - 1].username };
}
