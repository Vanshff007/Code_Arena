# Battles (client)

Find a match, lobby, countdown, the battle screen, results, rematch, match
history, replays and spectating.

## Files

| File | Job |
|---|---|
| `socketContext.js`, `SocketContext.jsx`, `useSocket.js` | One socket per logged-in user, authenticated by the session cookie. URL is `VITE_API_URL` without `/api`. |
| `battleState.js` | Event names (`EVENTS`) and pure helpers. |
| `FindBattlePage.jsx` | Quick match or blitz (with a search timer), create room, join by code. Leaves the queue on cancel or navigation. |
| `BattleRoomPage.jsx` | Lobby, split-color countdown, battle, result with rematch, replay link and editorial. Claims the battle on open; shows "open in another tab" when another tab takes it. Sends a code snapshot every 5 s while the code changes. |
| `lockdown.js` | `useBattleLockdown(active)`: blocks copy, cut, paste, right-click and drop while a battle runs, and reports when the player is outside fullscreen. `enterFullscreen()` for button handlers. |
| `VersusBar.jsx` | You (cobalt) vs opponent (crimson), passed-case pips, shared clock. |
| `BattleChat.jsx` | Room chat, with a notice when messages are rate-limited. Read-only for spectators. |
| `MatchRow.jsx`, `MatchHistoryPage.jsx`, `matchService.js` | History, marked "blitz" for blitz battles, with a Replay link when one exists. |
| `ReplayPage.jsx`, `replay.js` | Replay: play/pause, speed, scrubber with submission marks, both players' code at that time, submissions so far, editorial. |
| `WatchListPage.jsx`, `SpectatePage.jsx` | Live battles and the spectator view (progress, typing, timer; no code). |
| `battles.test.js` | Helpers, replay math, service, and an event-name contract check against the server source. |

## Behavior

- The typing indicator is sent at most once per second.
- Your progress shows after your own submit; the opponent's after theirs.
- On phones the clock sits above both players, and chat comes after the editor.
- The battle route is keyed by room code, so a rematch starts with a fresh page.
- During `in_progress`, copy, cut, paste, right-click and drag-and-drop are
  blocked on the whole page (editor, problem, chat, custom input). Fullscreen
  opens on the "I'm ready" click (browsers need a click). Outside fullscreen
  (quick match start, Esc, refresh), a gate covers the battle until the
  player enters it; the clock keeps running. Browsers without the
  fullscreen API skip the gate. Fullscreen closes when the battle ends.
  Client-side only: it stops casual copying, not dev tools.
- The result screen shows each player's attempts and when their best
  submission landed (`summaryLine`), side by side.

## Manual test cases

See `server/features/battles/README.md` (two browsers, two accounts, plus a
third to watch). Lockdown:

1. Room battle: "I'm ready" opens fullscreen. Quick match: the gate shows
   "Enter fullscreen" at the start.
2. In the battle, Ctrl+C / Ctrl+V / Ctrl+X and right-click do nothing in the
   editor, problem and chat. Dragging text into the editor does nothing.
3. Press Esc. The gate covers the battle; the clock keeps counting.
   "Enter fullscreen" brings the battle back.
4. When the battle ends, fullscreen closes and copy/paste work again.
5. On an iPhone, the battle plays without the gate.
