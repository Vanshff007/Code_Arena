# Leaderboard (client)

The rankings page.

## Files

| File | Job |
|---|---|
| `LeaderboardPage.jsx` | Ladder with rating bars; your row is marked in cobalt. Shows how far you are behind the next rank. |
| `ladder.js` | `ratingBarPercent`, `gapToNext`. |
| `leaderboardService.js` | `/leaderboard`. |
| `leaderboard.test.js` | Service contract and helper tests. |

## Manual test cases

1. With two players, the lower one sees "N points behind #1".
2. Click a name. Their profile opens.
