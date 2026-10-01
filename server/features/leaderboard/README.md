# Leaderboard (server)

Public rankings: all time by rating, and monthly seasons.

## Files

| File | Job |
|---|---|
| `leaderboard.routes.js`, `leaderboard.controller.js` | All-time list, season list, season ranking. |
| `seasons.js` | Season ids (`YYYY-MM`, UTC), date ranges, labels, and the aggregation over completed matches. |
| `leaderboard.test.js`, `seasons.test.js` | Automated tests. |

## API

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/leaderboard?limit=` | All time by rating (default 50, max 100). Row: `rank, username, rating, wins, losses, totalBattles, winRate` |
| GET | `/api/leaderboard/seasons` | The current month and every month with battles, newest first: `{ id, label, current }` |
| GET | `/api/leaderboard/seasons/:season` | Top 100 of that month by rating points gained. Row: `rank, username, rating, points, wins, battles` |

Seasons do not reset ratings; they only count the rating change of battles
that ended in that month. Never email or password.

## Tests

Automated: empty list, ordering and ranks, win rate with zero battles,
`limit`, no private fields (`leaderboard.test.js`); season ids and ranges,
ranking by points gained in the month only, malformed season rejected
(`seasons.test.js`).

Manual: finish a battle and check that both players move on the rankings
page, in All time and in the current season.
