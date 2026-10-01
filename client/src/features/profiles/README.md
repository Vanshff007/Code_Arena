# Profiles (client)

Public profile page.

## Files

| File | Job |
|---|---|
| `ProfilePage.jsx` | Rating, stats, badges, recent battles, LeetCode panel. |
| `profileService.js` | `/users/:username/profile` (username is URL-encoded). |
| `profiles.test.js` | Service contract tests. |

## Manual test cases

1. Open `/profile/nobody`. Expect "No player named".
2. Open your own profile. The LeetCode panel has Connect; on another player's it does not.
