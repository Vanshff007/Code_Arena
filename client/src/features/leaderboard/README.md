# Leaderboard (client)

The rankings page: all time and monthly seasons.

## Files

| File | Job |
|---|---|
| `LeaderboardPage.jsx` | All time / Seasons tabs. All time: ladder with rating bars; your row is marked in cobalt; how far you are behind the next rank. Seasons: month picker and points gained. |
| `ladder.js` | `ratingBarPercent`, `gapToNext`. |
| `leaderboardService.js` | `/leaderboard`, `/leaderboard/seasons`, `/leaderboard/seasons/:season`. |
| `leaderboard.test.js` | Service contract and helper tests. |

## Manual test cases

1. With two players, the lower one sees "N points behind #1".
2. Click a name. Their profile opens.
3. Open Seasons. The current month is selected and shows points gained.
