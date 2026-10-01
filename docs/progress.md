# Progress

Last updated: 2026-10-01.

## Completed

- JWT authentication: register, login, `/me`, protected routes, admin role
  set by CLI.
- Problem bank: CRUD (admin only), public list and detail, seed script,
  public and hidden test cases.
- Docker sandbox judge for C++, Java and Python: Run Code and Submit,
  verdicts, runtime and memory, concurrency limit and queue.
- Practice mode (`/practice/:id`) with the Monaco editor.
- Real-time battles over Socket.io: private rooms, random matchmaking,
  ready check, countdown, 15-minute timer, chat, typing indicator,
  opponent submission notice, disconnect grace and forfeit, resume after
  refresh.
- ELO ratings, wins and losses, match history, leaderboard, public profiles.
- Skill analyzer, per-topic XP and levels, problem recommendations,
  rule-based coach feedback, skill dashboard with radar chart.
- Optional LeetCode profile sync (unofficial API).
- Security: helmet, CORS allowlist, Mongo sanitize, hpp, rate limits,
  express-validator, JWT secret length check.
- Logging with Winston (daily rotation).
- Tests: auth, problems, matchmaking, judge. CI on GitHub Actions.
- Production setup: Docker MongoDB, PM2, Nginx, certbot (`DEPLOYMENT.md`).
- Feature-folder structure on both server (`server/features/`) and client
  (`client/src/features/`), with a `README.md` and tests for every feature.
- Version rule: client and server share one version (1.1.0), shown in the
  footer and `/api/health`, enforced by tests.
- New UI ("versus" design, `docs/design.md`): duel demo landing page,
  versus bar and split countdown in battles, rankings ladder, redesigned
  every page, phone layouts.
- Client test suite (Vitest): helpers, service contracts, socket event and
  language contract checks against the server.
- Fix: players can queue again right after a battle ends (finished rooms no
  longer count as "already in a battle").

- Function-style problems (1.2.0): players write only a `Solution` class,
  LeetCode style, in C++, Java or Python. Hidden harness, JSON test format,
  any-order answers, compile errors mapped to the player's lines. All 20
  built-in problems converted and checked with reference solutions.
- LeetCode practice suggestions (1.2.0): the Skills page lists LeetCode
  problems (as links) for the topics the player has been solving on LeetCode
  and their weakest topic, skipping recently solved and premium problems.

- Fuller LeetCode data (1.3.0): sync also reads all-time solves per topic,
  solved per language, the activity calendar and contest history (all public
  profile data). Skill scores use all-time solves, recommendations add an
  under-practiced core topic, and profiles show streak, top topics,
  languages and a contest rating chart.

## In progress / pending

- Nothing in progress.

## Planned / ideas

- Move room and queue state to Redis if more than one server instance is
  ever needed.

## Known limitations

- Single server instance only (in-memory battle state). Active battles are
  lost on server restart.
- LeetCode sync uses an unofficial endpoint. It can break or be blocked at
  any time.
- LeetCode only exposes recent accepted submissions, so it is a weak skill
  signal.
- Judge memory is the peak for the whole submission, not per test case.
  Reported runtime is the last test case's duration.
- Full-program (signature-less) problems still need Java code to use
  `public class Main`.
- LeetCode data needs a public profile and comes from an unofficial
  endpoint. "Currently solving" topics still come from the ~20 most recent
  accepted submissions; the full list of solved problems is not public.
- Function-style problems must return a value; in-place ("modify the array")
  problems are not supported yet.
- Client components have no rendering tests; only pure logic and service
  contracts are tested.
- The production runbook has not been run on a real VPS yet.
- A player's newest browser tab takes over their battle from older tabs.
- Fonts load from Google Fonts; until they arrive, text shows in the system font.
