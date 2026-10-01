# Battles (server)

Real-time 1v1 battles over Socket.io: matchmaking, private rooms, timer,
chat, ratings and match history.

## Files

| File | Job |
|---|---|
| `sockets.js` | Registers socket handlers; resumes a battle on reconnect. |
| `authSocket.js` | Checks the JWT from `socket.handshake.auth.token`. |
| `state.js` | In-memory queue and rooms. `findRoomByUserId` ignores completed rooms. |
| `roomManager.js` | Rooms, queue, countdown, 15-minute timer, chat, forfeit, battle end. |
| `ioInstance.js` | Shares the `io` instance. |
| `rating.service.js` | ELO, K = 32. |
| `Match.model.js` | Persisted battle, created when the battle starts. |
| `match.routes.js`, `match.controller.js` | `GET /api/matches/me`. |
| `battles.test.js`, `rating.test.js`, `state.test.js` | Automated tests. |

## Events

The full list is in `docs/api.md`. The client keeps the same names in
`client/src/features/battles/battleState.js`; a client test fails if a name
used there is missing here.

## Behavior

- Lifecycle: `waiting → countdown (5 s) → in_progress (15 min) → completed`.
- The first `Accepted` wins. On timeout, more passed cases wins, then the earlier submission.
- A disconnected player has 20 s to come back, then forfeits.
- A finished room stays in memory for 60 s for late events, but does not block a new match.
- **Single process only**: all state is in memory.

## Tests

Automated: queue, room, countdown, battle start and the empty problem bank
regression (`battles.test.js`); ELO math (`rating.test.js`); room lookup and
queueing again after a finished battle (`state.test.js`).

Manual (two browsers, two accounts):

1. Both click Find a match. Expect lobby, ready, countdown, battle.
2. Chat both ways. Typing shows on the other side.
3. Submit a wrong answer on one side. The other side sees the passed count.
4. Close one tab. The other side sees "Disconnected"; after 20 s it wins.
5. On the result screen, click Find another match. Expect to queue right away.

## Known issues

- Active battles are lost on a server restart.
- A player's newest tab takes over the battle from older tabs.
