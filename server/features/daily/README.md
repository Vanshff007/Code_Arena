# Daily problem (server)

One problem of the day for everyone, and each player's streak of days in a
row they solved it.

## Files

| File | Job |
|---|---|
| `DailyProblem.model.js` | One document per UTC day: `{ date: 'YYYY-MM-DD', problem }`. Unique on `date`. |
| `daily.service.js` | `getDailyProblem` (picks and stores today's problem on the first request), `getStreak`, and the pure helpers `dayId`, `previousDay`, `streakFrom`. |
| `daily.controller.js`, `daily.routes.js` | `GET /api/daily`. |
| `daily.test.js` | Automated tests. |

## API

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/daily` | user | `{ date, problem: { _id, title, difficulty, tags }, solvedToday, streak }`. 404 when the bank is empty |

## Behavior

- Days are UTC. The day's problem is picked at random from the whole bank on
  the first request that day and stored, so it stays fixed all day.
- If the stored problem was deleted, a new one is picked.
- Two first requests at once: the unique index makes one `create` fail with
  `11000`; that request reads the stored pick instead.
- Uses `find` + `skip`, not `$sample`, so `hiddenTestCases` stays excluded.
- A day counts toward the streak when the player has an accepted submission
  (practice or battle, from `PerformanceHistory`) on that day's problem
  during that UTC day.
- Today not solved yet does not break the streak; it counts back from
  yesterday. A missed day resets it. Streaks look back at most 366 days.

## Tests

Automated (`daily.test.js`): UTC day helpers, streak counting, login
required, 404 on an empty bank, same problem for every player, no hidden
tests in the response, a deleted pick is replaced, and streak rules (wrong
answers and solves on another day do not count).

Manual:

1. Open the dashboard. Expect a "Daily problem" card with a title and "No
   streak yet".
2. Log in as a second user. Expect the same problem.
3. Solve it in practice, then reopen the dashboard. Expect "Solved today"
   and "1 day streak".

## Known issues

- Days follow UTC, not the player's time zone.
