# Battles (client)

Find a match, lobby, countdown, the battle screen, results, rematch, match
history, replays and spectating.

## Files

| File | Job |
|---|---|
| `socketContext.js`, `SocketContext.jsx`, `useSocket.js` | One socket per logged-in user, authenticated by the session cookie. URL is `VITE_API_URL` without `/api`. |
| `battleState.js` | Event names (`EVENTS`) and pure helpers. |
| `FindBattlePage.jsx` | Quick match (with a search timer), create room, join by code. Leaves the queue on cancel or navigation. |
| `BattleRoomPage.jsx` | Lobby, split-color countdown, battle, result with rematch, replay link and editorial. Claims the battle on open; shows "open in another tab" when another tab takes it. Sends a code snapshot every 5 s while the code changes. |
| `VersusBar.jsx` | You (cobalt) vs opponent (crimson), passed-case pips, shared clock. |
| `BattleChat.jsx` | Room chat, with a notice when messages are rate-limited. Read-only for spectators. |
| `MatchRow.jsx`, `MatchHistoryPage.jsx`, `matchService.js` | History, with a Replay link when one exists. |
| `ReplayPage.jsx`, `replay.js` | Replay: play/pause, speed, scrubber with submission marks, both players' code at that time, submissions so far, editorial. |
| `WatchListPage.jsx`, `SpectatePage.jsx` | Live battles and the spectator view (progress, typing, timer; no code). |
| `battles.test.js` | Helpers, replay math, service, and an event-name contract check against the server source. |

## Behavior

- The typing indicator is sent at most once per second.
- Your progress shows after your own submit; the opponent's after theirs.
- On phones the clock sits above both players, and chat comes after the editor.
- The battle route is keyed by room code, so a rematch starts with a fresh page.

## Manual test cases

See `server/features/battles/README.md` (two browsers, two accounts, plus a
third to watch).
