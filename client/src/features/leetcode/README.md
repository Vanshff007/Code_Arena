# LeetCode (client)

The LeetCode panel on the profile page.

## Files

| File | Job |
|---|---|
| `LeetCodePanel.jsx` | Connect (then sync), Sync now, Disconnect for the owner; read-only stats for others. |
| `LeetCodeDetails.jsx` | Extra profile data: streak, active days, last 30 days, most solved topics, languages, contest rating chart. |
| `LeetCodePractice.jsx` | "Practice on LeetCode" section on the Skills page: suggested problems by topic, opening on leetcode.com. |
| `leetcode.js` | Username check that mirrors the server validator; `recommendationState`; `ratingChart` and `barPercent` for the profile chart and bars. |
| `leetcodeService.js` | `/leetcode/connect`, `/leetcode/sync`, `/leetcode/disconnect`, `/leetcode/recommendations`. |
| `leetcode.test.js` | Service contract and username tests. |

## Manual test cases

1. Enter `bad name!`. Expect a field error, no request.
2. Enter a username that does not exist. Expect "LeetCode username not found".
3. Sync your own public profile. The profile shows streak, topics, languages and (if you've done contests) a rating chart.
4. Without a linked account, the Skills page asks you to connect.
5. With a linked, synced account, the Skills page lists LeetCode problems per topic; links open leetcode.com in a new tab.
