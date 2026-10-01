# Skills (client)

The skill profile page.

## Files

| File | Job |
|---|---|
| `SkillDashboardPage.jsx` | Radar, weakest and strongest topics, CodeArena problems to practice, LeetCode suggestions (`leetcode/LeetCodePractice`), topic levels, coach notes. |
| `SkillRadar.jsx` | Hand-drawn SVG radar (needs 3+ topics). |
| `skills.js` | `weakTopics`, `strongTopics`, `xpPercent`. Thresholds match the server. |
| `skillService.js` | `/skills/me`, `/skills/xp`, `/skills/recommendations`, `/skills/feedback`. |
| `skills.test.js` | Service contract and helper tests. |

## Manual test cases

1. New account: every section shows a prompt instead of an empty box.
2. After accepted solutions in 3 topics, the radar draws.
