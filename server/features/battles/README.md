# Battles (server)

Real-time 1v1 battles over Socket.io: matchmaking, private rooms, timer,
chat, ratings, match history, replays, spectators and rematches.

## Files

| File | Job |
|---|---|
| `sockets.js` | Registers socket handlers (rate-limited, errors caught), tracks presence, resumes a battle on reconnect. |
| `authSocket.js` | Authenticates the socket from the `ca_token` cookie or `auth.token`. |
| `state.js` | In-memory queue and rooms, rating-based difficulty, snapshot limits. `findRoomByUserId` ignores completed rooms. |
| `roomManager.js` | Rooms, queue, countdown, 15-minute clock, chat, forfeit, battle end, persistence and restore, multi-tab claim, rematch, spectators, replays. |
| `ActiveRoom.model.js` | Copy of each in-progress battle, so a restart does not end it. |
| `BattleReplay.model.js` | Code snapshots and submissions of a finished battle. |
| `rating.service.js` | ELO, K = 32. |
| `Match.model.js` | Persisted battle, created when the battle starts. |
| `match.routes.js`, `match.controller.js` | History, live battles, replays. |
| `battles.test.js`, `battleFeatures.test.js`, `rating.test.js`, `state.test.js` | Automated tests. |

The shared `io` instance is in `server/core/io.js`; socket rate limits are in
`server/core/socketLimits.js`; online users are in `server/core/presence.js`.

## API

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/matches/me` | My history, with `hasReplay` |
| GET | `/api/matches/live` | Live battles to watch |
| GET | `/api/matches/:id/replay` | Replay of a finished battle; its two players only |

## Events

The full list is in `docs/api.md`. The client keeps the same names in
`client/src/features/battles/battleState.js`; a client test fails if a name
used there is missing here.

## Behavior

- Lifecycle: `waiting → countdown (5 s) → in_progress (15 min) → completed`.
- Difficulty follows the average rating: below 1150 Easy, below 1450
  Medium, else Hard. If the bank has none of that difficulty, any problem.
- The first `Accepted` wins. On timeout, more passed cases wins, then the earlier submission.
- A disconnected player has 20 s to come back, then forfeits. If both are
  gone, the clock decides.
- In-progress battles are written to `ActiveRoom` on start, on each
  submission and (throttled) on snapshots, and restored at boot. The clock
  uses `startedAt`, so downtime still counts.
- One socket owns each player's seat. A new tab sends `battle:claim` and the
  old tab gets `battle:takenOver`. A reconnect only takes over when the user
  has no other live socket.
- Clients send a code snapshot every 5 s while the code changes (max 20,000
  characters, 400 per player). They become a `BattleReplay` at the end.
- Spectators join `watch:<roomCode>` and get progress, typing and the
  timer, never code.
- After the end, either player may offer a rematch for 45 s. It starts a
  fresh battle with current ratings.
- A finished room stays in memory for 60 s for late events, but does not block a new match.
- **Single process only**: rooms and the queue are in memory.

## Tests

Automated: queue, room, countdown, battle start and the empty problem bank
regression (`battles.test.js`); difficulty from ratings, restore after a
restart, replays, several tabs, rematch, spectators, socket rate limits
(`battleFeatures.test.js`); ELO math (`rating.test.js`); room lookup,
queueing again, snapshots (`state.test.js`).

Manual (two browsers, two accounts, plus a third to watch):

1. Both click Find a match. Expect lobby, ready, countdown, battle.
2. Chat both ways. Typing shows on the other side. Send 6 messages fast;
   expect a "slow down" notice.
3. Submit a wrong answer on one side. The other side and the watcher see
   the passed count; the watcher never sees code.
4. Open the battle in a second tab. Expect the first tab to show "open in
   another tab".
5. Restart the server mid-battle. Expect both players back in the battle
   with the clock still counting.
6. Close one tab. The other side sees "Disconnected"; after 20 s it wins.
7. On the result screen, offer a rematch; accept on the other side. Expect
   a new battle. Then open the replay from History.
