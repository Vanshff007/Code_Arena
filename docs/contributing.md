# Contributing

This file describes the coding conventions and workflow.

## Workflow

1. Pull the latest `master`.
2. Create a branch: `feature/<name>`, `fix/<name>`, or `docs/<name>`.
3. Make the smallest change that solves the task.
4. Run the related checks (see `docs/development.md`):
   - Server change: `npm test` in `server/`.
   - Client change: `npm run lint`, `npm test` and `npm run build` in
     `client/`, plus the manual cases in the feature `README.md`.
   - Battle or socket change: also the manual battle check.
5. Update the related `docs/` files and the feature `README.md` in the same
   change.
6. Bump the version (see "Versioning" below).
7. Commit and open a pull request to `master`.

Ask the project owner before architectural, structural, or destructive
changes. Explain what changes, why, affected files, approach, and risks.

## Commits

- Use Conventional Commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`,
  `chore:`.
- One logical change per commit.
- Never force push, rewrite shared history, or commit `.env`, `node_modules/`,
  `dist/` or `logs/`.

## Versioning

The version shown in the site footer must be updated with every change that
is committed. Client and server always carry the **same** version.

- Use `MAJOR.MINOR.PATCH`:
  - `feat:` changes bump MINOR (1.1.0 → 1.2.0).
  - `fix:`, `docs:`, `refactor:`, `test:`, `chore:` changes bump PATCH
    (1.1.0 → 1.1.1).
  - Breaking changes bump MAJOR, only with the owner's approval.
- Bump both apps with the same command:
  ```bash
  cd server && npm version <patch|minor|major> --no-git-tag-version
  cd ../client && npm version <patch|minor|major> --no-git-tag-version
  ```
  This updates `package.json` and `package-lock.json` in each app.
- Nothing else needs editing: the footer reads the client version from
  `package.json` at build time (`vite.config.js`), and `GET /api/health`
  reports the server version.
- Include the bump in the same commit or pull request as the change.
- Tests enforce the rule: `server/features/health/health.test.js` and
  `client/src/features/health/health.test.js` fail if the versions differ,
  are not `MAJOR.MINOR.PATCH`, or the lock files are out of sync.
- In production the footer shows a warning if the server and client versions
  differ (a half-finished deploy).

## Code style

Match the existing code.

General:

- 2-space indentation, semicolons, single quotes.
- `const` by default, `let` when reassigned, never `var`.
- `camelCase` for variables and functions, `PascalCase` for React components
  and Mongoose models, `UPPER_SNAKE_CASE` for constants (`K_FACTOR`,
  `DISCONNECT_GRACE_MS`, `MAX_QUEUE_LENGTH`).
- Socket event names use `namespace:action` (`room:join`, `battle:end`).
- Comments explain **why**, not what. The code base has detailed rationale
  comments; keep that style for non-obvious logic.

Server:

- ESM (`import`/`export`). Include the `.js` extension in relative imports.
- File names: `<name>.routes.js`, `<name>.controller.js`,
  `<name>.service.js`, `<Name>.model.js`, `<name>.validator.js`,
  `<name>.test.js`.
- Controllers use `try/catch` and call `next(err)`. Handle known cases first
  (`11000` → 409, `JudgeQueueFullError` → 503).
- Validate input with express-validator chains in the feature's
  `<name>.validator.js`, then `validate` from `core/middleware/validate.js`.
- Responses use `{ success, message?, data? }`.
- Log with `core/utils/logger.js`. No `console.*` in app code. Exceptions:
  `core/config/env.js` (before the logger exists) and CLI scripts
  (`makeAdmin.js`, `seedProblems.js`, `buildImages.js`).
- Keep business logic in services, not in controllers or socket handlers.
  Prefer pure functions where possible (see `scoring.service.js`,
  `rating.service.js`).

Client:

- React function components and hooks. JSX files use `.jsx`.
- All API calls go through the feature's `<name>Service.js`, which uses
  `shared/api.js`. Never import axios in a component.
- Show API errors with `shared/getErrorMessage.js`.
- Put logic that can be tested without a browser in a plain `.js` file next
  to the component (for example `battleState.js`, `ladder.js`).
- Follow `docs/design.md`: use the tokens (`bg-panel`, `text-p1`,
  `border-rule`, ...), never raw hex or default Tailwind colors, and reuse
  `shared/ui/` components before creating new ones.
- Icons come from `lucide-react`. Keep motion to what `docs/design.md`
  allows.
- A file that exports a React component exports only components (oxlint
  fast-refresh rule); put helpers in a separate `.js` file.

## Rules

- Do not add dependencies when Node, the browser or an installed package can
  do the job.
- Never expose `hiddenTestCases` or `password` in responses, socket events or
  logs.
- Do not loosen sandbox container flags (`docs/execution.md`).
- Keep the server single-process (`docs/architecture.md`).
- The submission tracking pipeline must never break the submit response.
- LeetCode failures must be handled as normal outcomes.
- Keep server and client contracts in sync, and update `docs/api.md`.

## Feature folders

Every feature has its own folder, on each side that has code for it, with
the code, a detailed `README.md`, and tests.

Server:

```
server/features/<name>/
├── <name>.routes.js       # mounted in server/app.js
├── <name>.controller.js
├── <name>.service.js      # business logic (if any)
├── <name>.validator.js    # input validation (if any)
├── <Name>.model.js        # if it stores data
├── <name>.test.js         # Vitest; more than one test file is fine
└── README.md              # purpose, files, API/events, behavior, test cases, known issues
```

Client:

```
client/src/features/<name>/
├── <Name>Page.jsx         # route added in src/App.jsx
├── <Component>.jsx        # feature-only components
├── <name>.js              # pure helpers
├── <name>Service.js       # API calls through shared/api.js
├── <name>.test.js         # Vitest (Node, no DOM)
└── README.md              # files, behavior, manual test cases
```

Folder names are lowercase. Code used by more than one feature goes in
`server/core/` or `client/src/shared/`, not in a feature. A feature may
import from another feature when the domain needs it; keep that one-way.

To add a feature:

1. Create the folder(s) with the files above (skip what the feature does not
   need).
2. Server: mount the routes in `server/app.js`.
3. Client: add the page route in `client/src/App.jsx` (inside
   `ProtectedRoute` if it needs login) and a navbar link if it is a top-level
   page.
4. Write the README, including manual test cases.

A feature is complete only when it has:

- The implementation.
- Tests for normal behavior, edge cases and error cases, actually run.
- A `README.md`.
- Updated docs: `docs/api.md` for endpoints and events, `docs/database.md`
  for models, `docs/architecture.md` for new parts, and `docs/progress.md`.
- A version bump.
