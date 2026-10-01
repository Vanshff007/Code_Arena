# Battles (client)

Find a match, lobby, countdown, the battle screen, results and match history.

## Files

| File | Job |
|---|---|
| `SocketContext.jsx`, `useSocket.js` | One socket per logged-in user. URL is `VITE_API_URL` without `/api`. |
| `battleState.js` | Event names (`EVENTS`) and pure helpers. |
| `FindBattlePage.jsx` | Quick match (with a search timer), create room, join by code. Leaves the queue on cancel or navigation. |
| `BattleRoomPage.jsx` | Lobby, split-color countdown, battle, result. |
| `VersusBar.jsx` | You (cobalt) vs opponent (crimson), passed-case pips, shared clock. |
| `BattleChat.jsx` | Room chat. |
| `MatchRow.jsx`, `MatchHistoryPage.jsx`, `matchService.js` | History. |
| `battles.test.js` | Helpers, service, and an event-name contract check against the server source. |

## Behavior

- The typing indicator is sent at most once per second.
- Your progress shows after your own submit; the opponent's after theirs.
- On phones the clock sits above both players, and chat comes after the editor.

## Manual test cases

See `server/features/battles/README.md` (two browsers, two accounts).
