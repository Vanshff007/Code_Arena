# Home (client)

Landing page and the 404 page.

## Files

| File | Job |
|---|---|
| `HomePage.jsx` | Hero, "How a battle runs", short feature notes. |
| `DuelDemo.jsx` | Scripted mock duel. The only ambient animation in the app; shows the final frame when reduced motion is on. |
| `duelScript.js` | Demo content and `demoFrame(t)`, a pure function of elapsed time. |
| `NotFoundPage.jsx` | 404. |
| `home.test.js` | Demo timeline tests. |

## Manual test cases

1. Watch the demo loop: typing, the right player misses, the left player is accepted, then it restarts.
2. Turn on reduced motion in the OS. The demo shows the finished state and does not move.
