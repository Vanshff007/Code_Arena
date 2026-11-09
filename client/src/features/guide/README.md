# Guide (client)

The beginner's guide at `/guide`: practice, the first battle, battle rules
(fullscreen, no copy/paste), rating and progress. Public, no login needed.

## Files

| File | Job |
|---|---|
| `guide.js` | Guide content (`GUIDE_SECTIONS`): title, points, optional link. |
| `GuidePage.jsx` | Renders the sections as numbered cards. |
| `guide.test.js` | Every section has points, every link is a real route, the route is public. |

Linked from the home page ("How a battle runs") and the footer.

## Manual test cases

1. Logged out, open `/guide`. The page shows without asking to log in.
2. Each card link opens its page (logged out, protected pages go to login).
3. On a phone width the cards stack in one column.
4. When battle rules change (duration, grace time, lockdown), update `guide.js`.
