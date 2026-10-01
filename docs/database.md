# Database

CodeArena uses MongoDB 7 through Mongoose 8. Each model lives in the feature folder that owns it (`server/features/<feature>/<Name>.model.js`).

## Connection

- `server/core/config/db.js` connects with `MONGO_URI`.
- Local and production: MongoDB runs in Docker (`docker compose up -d` at the
  repo root), bound to `127.0.0.1:27017` only.
- Dev database: `codearena`. Test database: `codearena_test` (forced by
  `server/core/testSetup.js`).

## Models

| Model | Purpose | Key fields |
|---|---|---|
| `User` | Account and stats | `username` (3–20), `email`, `password` (`select: false`), `role` (`user`/`admin`), `rating` (default 1000), `wins`, `losses`, `totalBattles`, `leetcode` sub-document (`username`, `stats`, `topicCounts`, `recentSolvedSlugs`, `allTimeTopicCounts`, `languages`, `activity`, `contestHistory`, sync status) |
| `Problem` | Problem bank | `title` (unique), `difficulty` (`Easy`/`Medium`/`Hard`), `description`, `constraints`, `examples`, `publicTestCases`, `hiddenTestCases` (`select: false`), `tags` (lowercase), `signature` (`functionName`, `params[{name,type}]`, `returnType`; optional), `outputOrder` (`exact`/`any`), `createdBy`. Virtual `starterCode` in JSON |
| `Match` | Finished or running battle | `problem`, `players` (exactly 2, with verdict and rating before/after), `status` (`in_progress`/`completed`/`aborted`), `winner` (null = draw or aborted), `isDraw`, `durationMs`, `startedAt`, `endedAt` |
| `PerformanceHistory` | One row per submission | `user`, `problem`, `language`, `verdict`, `isAccepted`, `timeTakenMs`, `runtimeMs`, `memoryKb`, `wrongAttemptsBeforeThis`, `difficulty`, `topics` |
| `SkillProfile` | Topic scores per user | `user`, `topicScores` (map, 0–100), `lastUpdatedAt` |
| `XPProgress` | XP per user per topic | `user`, `topic`, `xp`. Unique index on `{ user, topic }` |
| `RecommendationHistory` | Recommended problems | `user`, `problem`, `topic`, `reason`, `recommendedAt`, `solvedAt` |
| `AIFeedbackHistory` | Coach feedback | `user`, `problem`, `submissionResultRef`, `messages`, `recommendedNext` |

Indexes on `PerformanceHistory`: `{ user, problem }` and `{ problem, isAccepted }`.

## Rules

- Fields with `select: false` (`User.password`, `Problem.hiddenTestCases`) must
  stay that way. Read them only with an explicit `.select('+field')` where
  needed.
- Problem test cases are Mongoose sub-documents. Read `input` and `output`
  explicitly; spreading a sub-document does not copy schema fields reliably.
- Room and matchmaking state are **not** in the database. They live in
  `server/features/battles/state.js`.
- Handle duplicate-key error `11000` as HTTP 409.
- Seed problems with `npm run seed-problems` (idempotent, skips existing
  titles). `npm run seed-problems -- --update` overwrites the built-in
  problems matched by title, keeping their ids; other problems are not touched.
- Test cases of function-style problems hold JSON (one value per parameter
  per line). See `docs/execution.md`.
- A schema change that affects existing documents needs a migration plan and
  owner approval (see `docs/contributing.md`).
