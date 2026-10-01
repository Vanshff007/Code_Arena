# Leaderboard (server)

Public ranking by rating.

## Files

| File | Job |
|---|---|
| `leaderboard.routes.js`, `leaderboard.controller.js` | `GET /api/leaderboard?limit=` (default 50, max 100). |
| `leaderboard.test.js` | Automated tests. |

Each row: `rank, username, rating, wins, losses, totalBattles, winRate`.
Never email or password.

## Tests

Automated: empty list, ordering and ranks, win rate with zero battles,
`limit`, no private fields.

Manual: finish a battle and check that both players move on the rankings page.
