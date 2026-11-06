# Daily problem (client)

The dashboard card for the problem of the day and the player's streak.

## Files

| File | Job |
|---|---|
| `dailyService.js` | `getDaily()` calls `GET /api/daily`. |
| `daily.js` | `streakText(streak)`. |
| `DailyCard.jsx` | Shown on the dashboard: title, difficulty, streak, and a link to solve it in practice (or "Solved today"). Hidden if the request fails, for example when the bank is empty. |
| `daily.test.js` | Service contract and `streakText`. |

## Manual test cases

See `server/features/daily/README.md`. Also check the card in dark mode and
at 390px wide.
