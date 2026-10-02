# Progress

Last updated: 2026-10-02. Current version: 1.5.0.

## Status

**Not deployed anywhere yet.** The app runs locally only. The production
configuration (`docker-compose.yml`, `deploy/`) and the runbook
(`DEPLOYMENT.md`) are written but have never been used on a real server.

## Completed

- Authentication: register, login, `/me`, protected routes, admin role
  set by CLI.
- Problem bank: CRUD API (admin only), public list and detail, seed script,
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
- Security: helmet, CORS allowlist, Mongo sanitize, hpp, rate limits,
  express-validator, JWT secret length check.
- Logging with Winston (daily rotation).
- CI on GitHub Actions: server tests (with the real Docker judge), client
  lint, tests and build. Green on `master` since 1.3.1.
- Production configuration and runbook written (Docker MongoDB, PM2,
  Nginx, certbot). Not used yet - see Status.
- Feature-folder structure on both server (`server/features/`) and client
  (`client/src/features/`), with a `README.md` and tests for every feature.
- Version rule (1.1.0): client and server share one version, shown in the
  footer and `/api/health`, enforced by tests.
- New UI (1.1.0, "versus" design, `docs/design.md`): duel demo landing
  page, versus bar and split countdown in battles, rankings ladder, every
  page redesigned, phone layouts.
- Client test suite (Vitest): helpers, service contracts, socket event and
  language contract checks against the server.
- Fix (1.1.0): players can queue again right after a battle ends.
- Function-style problems (1.2.0): players write only a `Solution` class,
  LeetCode style, in C++, Java or Python. Hidden harness, JSON test format,
  any-order answers, compile errors mapped to the player's lines. All 20
  built-in problems converted and checked with reference solutions.
- LeetCode practice suggestions (1.2.0): the Skills page lists LeetCode
  problems (as links) for the topics the player is working on.
- Fuller LeetCode data (1.3.0): sync reads all-time solves per topic,
  solved per language, the activity calendar and contest history (public
  profile data). Skill scores use all-time solves, recommendations add an
  under-practiced core topic, and profiles show streak, top topics,
  languages and a contest rating chart.
- Fix (1.3.1): the judge failed every submission on Linux ("Permission
  denied") because the sandbox user could not open the per-submission
  folder. Hidden on Windows; caught by CI.

- 1.4.0, fairer and sturdier battles: problem difficulty follows the
  players' ratings; in-progress battles survive a server restart
  (`ActiveRoom`); one tab owns a battle, other tabs show "open in another
  tab" with a button to take it back; rematch offer on the result screen.
- 1.4.0, security: session in an httpOnly cookie (no token in
  `localStorage`); log out on all devices and password change revoke every
  other session; per-socket rate limits on chat, typing and other events;
  admin problem routes rate-limited.
- 1.4.0, product: battle replays (both players' code over time, players
  only); editorial after a battle (and in practice, with lower points);
  spectator mode (progress only, code hidden); friends with online status
  and live challenges; monthly seasons ranked by points gained; dark mode
  with a Settings page.
- 1.4.0, admin page: problem list and editor with a signature builder,
  examples, public and hidden tests, editorial, and a reference solution
  that must pass the judge before saving.
- 1.4.0, housekeeping: the 2 lint warnings are gone (`AuthContext` and
  `SocketContext` split from their providers).
- 1.5.0, more problems: 40 new built-in problems (14 Easy, 16 Medium,
  10 Hard), 60 in total, each with a verified Python reference solution and
  an editorial. C++ and Java references now cover every parameter and
  return type in the bank (checked by a test).

## In progress / pending

- Nothing in progress.

## Planned / ideas

Ordered by priority. Recommended next three: deploy and smoke test, client
component tests, then in-place problems.

### 1. Do first

- **Deploy and smoke test.** Follow `DEPLOYMENT.md` on a real Linux VPS and
  run its smoke test (section 9). The 1.3.1 Linux bug shows the runbook needs
  a real run before anyone relies on it. The client and API must be on the
  same site now that the session is a cookie.
- **More problems over time.** 60 built-in problems now; keep adding
  through the admin page, especially Hard ones (15 so far).

### 2. Judge

- **In-place / void problems** (the method changes its input), e.g. Rotate
  Array, Sort Colors.
- **JavaScript or TypeScript** as a fourth language (one harness file, one
  image, one stub per `docs/execution.md`).

### 3. Scale

- **Shared state for more than one server**: rooms, queue and presence in
  Redis, plus the Socket.io Redis adapter. Only needed when one process is
  not enough.

### 4. Housekeeping

- **Client component tests** (React Testing Library); today only logic and
  service contracts are tested, plus a manual browser run.
- **Monitoring:** error tracking (e.g. Sentry) and judge metrics (queue
  length, failures).
- **Replay storage:** replays keep up to 400 snapshots per player; add a
  cleanup job if the collection grows large.

## Known limitations

- Not deployed; the production runbook is untested.
- Single server instance only (in-memory rooms, queue and presence).
  In-progress battles survive a restart, but lobbies and the queue do not.
- The web app and the API must be served from the same site (cookie
  session).
- Updating to 1.4.0 logs everyone out once (sessions moved from
  `localStorage` to a cookie).
- The built-in bank has 21 Easy, 24 Medium and 15 Hard problems, so
  players in the same rating band still see repeats over many battles.
- LeetCode data needs a public profile and comes from an unofficial
  endpoint that can break or be blocked at any time. "Currently solving"
  topics come from the ~20 most recent accepted submissions; the full list
  of solved problems is not public.
- Function-style problems must return a value; in-place ("modify the
  array") problems are not supported yet.
- Full-program (signature-less) problems still need Java code to use
  `public class Main`.
- Judge memory is the peak for the whole submission, not per test case.
  Reported runtime is the last test case's duration.
- Client components have no rendering tests; only pure logic and service
  contracts are tested.
- Fonts load from Google Fonts; until they arrive, text shows in the system
  font.
