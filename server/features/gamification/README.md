# Gamification (server)

Server side of the gamification plan (`docs/progress.md`). Phase B: recent
form and win streak for the versus bar. Phase C: arena XP and the overall
level.

## Files

| File | Job |
|---|---|
| `form.service.js` | `formFromMatches(matches, userId)` (pure): last 5 results, oldest first (`W`, `L`, `D`), and the current win streak. `getRecentForm(userIds)`: reads each player's last 20 completed matches. |
| `ArenaXP.model.js` | Arena XP ledger: one entry per player per finished battle (`user`, `match`, `xp`, `items`). Unique on `{ user, match }`. |
| `arenaXp.service.js` | `arenaXpBreakdown(player)` (pure): the XP lines. `awardArenaXp(matchId, players)`: saves them and returns `{ gained, items, overall }` per user. `getOverallXp(userId)`: `arenaXp` and `overall` level (topic XP + arena XP). |
| `gamification.test.js` | Form rules, arena XP rules and ledger, and the database reads. The battle side is in `battles/battleFeatures.test.js` ("recent form"). |

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

### Arena XP (phase C)

| Line | XP | When |
|---|---|---|
| Battle played | 10 | Always |
| Win | 30 | Won |
| Draw | 15 | Draw |
| Solved | 20 | Best submission Accepted |
| Speed | up to 20 | Accepted: `20 x (1 - timeMs / durationMs)`, rounded |
| First try | 10 | Accepted on the first submission |
| Upset win | 15 | Won against a rating at least 100 higher |

- `endBattle` (`battles/roomManager.js`) calls `awardArenaXp` and puts
  `xp` on each `battle:end` result. A failure is logged, `xp` is `null`,
  and the battle still ends. No match id (match not saved): no XP.
- A forfeit counts like any loss or win.
- Counted from launch; no backfill. Level uses the topic curve in
  `skills/xp.service.js`.
- `GET /api/skills/xp` adds `arenaXp` and `overall`.

## Manual test cases

1. Play two battles with the same account and win both, then a third.
   Under your name in the versus bar: filled cobalt squares for the wins.
2. With 3 or more wins in a row, "3 wins in a row" shows next to the squares.
3. The opponent's wins are crimson, losses hollow, draws grey.
4. A brand-new account shows no squares.
5. Refresh mid-battle: the squares stay.
6. Win a battle on the first submission. The result shows "+N XP" with
   Battle played, Win, Solved, Speed and First try, and a level bar.
7. Lose a battle without solving. The result shows "+10 XP".
8. Open Skills. "Overall" level shows above the topic levels, with the
   arena XP total.
