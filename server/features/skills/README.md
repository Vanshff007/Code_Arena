# Skills (server)

Skill scores, XP, recommendations and coach feedback, built from submissions.

## Files

| File | Job |
|---|---|
| `topics.js` | Canonical topics, LeetCode tag map, concept progression. |
| `skillAnalyzer.service.js` | 0–100 score per topic (70% CodeArena history, 30% LeetCode seed). The seed uses all-time LeetCode solves per topic when a sync has them (1 → 15, 7 → 45, 63 → 90, 127+ → 100), else the recent-window counts. |
| `scoring.service.js` | Pure per-submission score. |
| `xp.service.js` | XP and level curve. |
| `recommendation.service.js` | Weak (<40) and strong (>75) topics to concepts to problems. |
| `aiCoach.service.js` | Rule-based feedback. Not an LLM, by design. |
| `performanceTracker.service.js` | Runs after every submit and ties the services above together. |
| `*.model.js` | `SkillProfile`, `PerformanceHistory`, `XPProgress`, `RecommendationHistory`, `AIFeedbackHistory`. |
| `skill.routes.js`, `skill.controller.js` | `/api/skills`. |
| `skills.test.js` | Automated tests. |

## API (all need login)

`GET /api/skills/me`, `/api/skills/xp`, `/api/skills/recommendations`,
`/api/skills/feedback`.

## Tests

Automated: scoring, XP curve, topic scores, recommendations, coach messages,
and each endpoint (login required, empty profile, XP ordering).

Manual: solve two problems in practice. The skills page shows XP and a coach note.
