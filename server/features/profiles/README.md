# Profiles (server)

Public player profiles.

## Files

| File | Job |
|---|---|
| `profile.routes.js`, `profile.controller.js` | `GET /api/users/:username/profile`. |
| `profiles.test.js` | Automated tests. |

Returns public stats, rank, computed badges (First Blood, Rising Star,
Veteran, Expert, Master), read-only LeetCode data (stats, top 6 topics,
languages, activity, contest history) and the last 5 matches.
Never email, password or role.

## Tests

Automated: 404 for an unknown user, rank and badges, no badges for a new
user, no private fields, LeetCode data shown.

Manual: open another player's profile from the rankings page. The LeetCode
panel has no buttons.
