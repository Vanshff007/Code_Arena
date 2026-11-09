# Gamification (server)

Server side of the gamification plan (`docs/progress.md`). Phase B: recent
form and win streak for the versus bar.

## Files

| File | Job |
|---|---|
| `form.service.js` | `formFromMatches(matches, userId)` (pure): last 5 results, oldest first (`W`, `L`, `D`), and the current win streak. `getRecentForm(userIds)`: reads each player's last 20 completed matches. |
| `gamification.test.js` | Form rules and the database read. The battle side is in `battles/battleFeatures.test.js` ("recent form"). |

## Behavior

- `startBattle` (`battles/roomManager.js`) calls `getRecentForm` after
  picking the problem and puts `form` and `streak` on each room player.
  A failed lookup is logged and the battle starts without form.
- Every public player object (`room:state`, `battle:start`,
  `battle:resume`, `spectate:state`) carries `form` (array, empty in the
  lobby) and `streak` (number). Only results, never code or opponents.
- `form` and `streak` are saved on `ActiveRoom.players`, so a restart keeps
  them.
- Only completed matches count; aborted and in-progress ones are skipped.
  A streak is counted within the last 20 matches only.

## Manual test cases

1. Play two battles with the same account and win both, then a third.
   Under your name in the versus bar: filled cobalt squares for the wins.
2. With 3 or more wins in a row, "3 wins in a row" shows next to the squares.
3. The opponent's wins are crimson, losses hollow, draws grey.
4. A brand-new account shows no squares.
5. Refresh mid-battle: the squares stay.
