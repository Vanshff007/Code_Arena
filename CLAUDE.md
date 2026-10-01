# CLAUDE.md

# CodeArena

CodeArena is a real-time 1v1 competitive coding platform. Two players get the
same problem, and the first correct submission wins (ELO-rated). It also has a
practice mode, a skill analyzer with XP, a rule-based coach, and optional
LeetCode sync.

Monorepo: `client/` (React + Vite) and `server/` (Node + Express + Socket.io +
MongoDB + Docker judge). Each app has its own `package.json` and `.env`. Run
npm commands inside `client/` or `server/`.

Both apps are organized by feature: `server/features/<name>/` and
`client/src/features/<name>/`. Shared code lives in `server/core/` and
`client/src/shared/`.

---

## Documentation

The `docs/` directory contains detailed documentation about the project.

These files are not loaded automatically. Read only the ones the task
needs, using the list below.

When making changes, read the documentation relevant to the task:

- `docs/architecture.md` — Read before making architectural, backend,
  frontend, or real-time system changes.

- `docs/api.md` — Read before modifying REST endpoints, Socket.io events,
  client-server messages, or request/response behavior.

- `docs/database.md` — Read before modifying database logic, models,
  schemas, or database-related functionality.

- `docs/execution.md` — Read before modifying the Docker sandbox judge,
  verdicts, test case handling, or supported languages.

- `docs/design.md` — Read before changing the UI: colors, type, layout,
  components, motion, or interface text.

- `docs/development.md` — Read when modifying the development workflow,
  setup, commands, tests, or local environment.

- `docs/deployment.md` — Read before making production, hosting,
  deployment, domain, HTTPS, or infrastructure changes. The full runbook
  is `DEPLOYMENT.md` at the repo root.

- `docs/contributing.md` — Read when making changes related to coding
  conventions, feature folders, versioning, or contribution workflow.

- `docs/progress.md` — Read when determining current project status,
  completed work, pending work, or planned features.

Each feature folder also has a `README.md` (files, API or events, behavior,
test cases, known issues). Read it before changing that feature.

Do not assume the contents of these documents. Read the relevant file when
its information is needed.

---

## Core Rules

- Understand the existing code before modifying it.
- Preserve existing functionality.
- Make the smallest reasonable change.
- Do not rewrite working code unnecessarily.
- Do not make unrelated changes.
- Do not add unnecessary dependencies.
- Keep documentation synchronized with the implementation.
- Test changes before considering them complete.

---

## Project Invariants

Never break these without explicit owner approval:

- Never expose `hiddenTestCases` or `password` in any response, socket
  event, or log.
- Never loosen the sandbox container flags in
  `server/features/execution/engine/dockerRunner.js`.
- The server runs as exactly one process. Battle and matchmaking state live
  in memory (`server/features/battles/state.js`).
- Do not containerize the Node server. It must run natively next to Docker.
- The submission tracking pipeline must never break the submit response.
- LeetCode failures are normal outcomes and must never crash the app.

---

## Major Changes

Ask for user approval before making any major architectural, structural,
or potentially destructive change.

Before asking for approval, explain:

1. What will change
2. Why the change is needed
3. Which files/components may be affected
4. The proposed approach
5. Potential risks or side effects

Wait for approval before proceeding.

---

## Feature Rules

Every feature must be organized as a dedicated feature folder:
`server/features/<name>/` and/or `client/src/features/<name>/`.

Each feature should contain:

- Its implementation/code
- `README.md` with detailed documentation
- Test file(s)
- Test cases (automated, plus manual cases in the README)
- Feature-specific supporting files where required

Layouts and the steps to add a feature are in `docs/contributing.md`.

A feature is not considered complete until its implementation, documentation,
and appropriate tests are present.

---

## Version Rule

The version shown in the site footer must be updated with every change that
is committed.

- Client and server always have the same `MAJOR.MINOR.PATCH` version.
- `feat:` bumps MINOR; `fix:`, `docs:`, `refactor:`, `test:` and `chore:`
  bump PATCH. MAJOR only with owner approval.
- Bump with `npm version <patch|minor|major> --no-git-tag-version` in both
  `server/` and `client/`. Nothing else needs editing.
- Include the bump in the same commit or pull request as the change.
- The health tests fail if the two versions differ.

Details: `docs/contributing.md` ("Versioning").

---

## Testing Rules

- Add tests when creating a feature.
- Update tests when feature behavior changes.
- Test normal behavior.
- Test important edge cases.
- Test error cases where applicable.
- Actually run the relevant tests.
- Never claim that a test passed unless it was actually executed.

Server tests need MongoDB on `127.0.0.1:27017`, a running Docker daemon, and
built sandbox images (`npm run docker:build`). If these are not available,
say so instead of skipping silently. Client tests need nothing running: run
`npm test`, `npm run lint` and `npm run build` in `client/`.

---

## Git Safety

Do not:

- Delete user work
- Overwrite unrelated changes
- Rewrite Git history
- Force push
- Perform destructive Git operations
- Commit `.env` files

Ask for approval before any potentially destructive Git operation.

---

## Completion

After completing a task, report:

- What was changed
- Files created or modified
- Tests run and their results
- Documentation updated
- Any remaining issues or untested areas
