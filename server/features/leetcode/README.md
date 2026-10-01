# LeetCode (server)

Optional link to a public LeetCode profile, used as a cold-start skill signal.

## Files

| File | Job |
|---|---|
| `leetcode.service.js` | Unofficial LeetCode GraphQL client: profile stats, contest info, recent accepted submissions, and profile extras (all-time topic counts, languages, activity calendar, contest history) in one query. |
| `leetcodeRecommendations.service.js` | Picks focus topics and LeetCode problems to suggest (links only), with a 6-hour cache per topic list. |
| `leetcode.routes.js`, `leetcode.controller.js`, `leetcode.validator.js` | `/api/leetcode`. |
| `leetcode.test.js` | Automated tests with `fetch` stubbed. |

## API (all need login)

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/leetcode/connect` | Save the username (no sync) |
| POST | `/api/leetcode/sync` | Fetch stats. 404 for an unknown user, 502 when LeetCode is unreachable |
| POST | `/api/leetcode/disconnect` | Clear the link and recalculate skills |
| GET | `/api/leetcode/recommendations` | LeetCode problems to practice by topic. 400 if not connected, 502 if LeetCode is down |

## What a sync stores

All public profile data, nothing that needs the player's LeetCode login:

| Field | From | Used for |
|---|---|---|
| `stats` | solved counts, contest rating | Profile |
| `topicCounts` | tags of the ~20 most recent accepted submissions | "Currently solving" topics in recommendations |
| `recentSolvedSlugs` | the same recent submissions | Skipping just-solved problems |
| `allTimeTopicCounts` | `tagProblemCounts` (the profile's Skills box) | Skill scores (all-time curve), gap topics, profile |
| `languages` | `languageProblemCount` | Profile |
| `activity` | `userCalendar` (streak, active days, last 30 days) | Profile |
| `contestHistory` | `userContestRankingHistory`, last 20 attended | Profile rating chart |

The extras are best-effort: if that request fails, the sync still succeeds
with the basic stats. A full list of every solved problem is not public
(LeetCode only shows it to the logged-in owner), so it is not used.

## Recommendations

- Topics (at most 3): up to two the player solved most among their recent
  LeetCode accepted submissions, then their weakest skill topic (score below
  60), then the core topic with the fewest all-time solves (a gap). No data:
  Arrays and Hashing.
- Difficulty per topic from the skill score: below 40 Easy, up to 75
  Medium, above that Hard.
- Free problems only, minus the recently solved ones (`recentSolvedSlugs`,
  saved on sync), highest acceptance rate first, 5 per topic.
- Problems are links to leetcode.com. LeetCode publishes no test cases and
  its problem text is not ours to copy, so nothing is imported.

Failures are normal outcomes: they are stored on the user
(`syncStatus: 'failed'`) and returned as errors, never crashes.

## Tests

Automated: login required, invalid username, connect, sync before connect,
successful sync (recent slugs, all-time topics, languages, activity, contest
history, and all-time counts feeding skill scores), unknown user, LeetCode down,
disconnect, recommendations (not connected, filtering, LeetCode down) and the
topic/difficulty/filter rules including the gap topic, and the pure helpers
(`topicCountsFromTags`, `summarizeCalendar`, `summarizeContests`). No real
network calls.

Manual: connect a real public username from your profile page and check the stats.

## Known issues

- The endpoint is unofficial and can change or block requests at any time.
