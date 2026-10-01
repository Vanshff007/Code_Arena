# Development

This file describes local setup, commands and tests.

## Requirements

- Node 22 or later (`server/.nvmrc`)
- Docker (Docker Desktop on Windows) — needed for MongoDB, the judge and the
  tests
- Git

## Setup

```bash
# 1. MongoDB
docker compose up -d            # repo root, starts MongoDB only

# 2. Server
cd server
cp .env.example .env            # set JWT_SECRET (32+ characters)
npm install
npm run docker:build            # build sandbox images
npm run seed-problems           # load the problem bank
npm run dev                     # http://localhost:5000

# 3. Client (new terminal)
cd client
cp .env.example .env            # VITE_API_URL=http://localhost:5000/api
npm install
npm run dev                     # http://localhost:5173
```

Generate a secret:
`node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

Make an admin (needed to create, edit or delete problems):
`npm run make-admin -- <email>` in `server/`.

## Environment variables

`server/.env`:

| Variable | Required | Default | Notes |
|---|---|---|---|
| `NODE_ENV` | no | `development` | |
| `PORT` | no | `5000` | |
| `MONGO_URI` | yes | — | Server exits if missing |
| `CLIENT_URL` | no | `http://localhost:5173` | CORS origins, comma-separated |
| `JWT_SECRET` | yes | — | 32+ characters, server exits otherwise |
| `JWT_EXPIRES_IN` | no | `7d` | |

`client/.env`:

| Variable | Notes |
|---|---|
| `VITE_API_URL` | Backend API base, for example `http://localhost:5000/api` |

## Commands

Server (`cd server`):

| Command | Purpose |
|---|---|
| `npm run dev` | Dev server with nodemon |
| `npm start` | Production start |
| `npm test` | All tests (Vitest) |
| `npx vitest run features/<name>` | One feature's tests |
| `npm run docker:build` | Build sandbox images |
| `npm run seed-problems` | Seed problems (idempotent) |
| `npm run seed-problems -- --update` | Overwrite the built-in problems with the current seed data |
| `npm run make-admin -- <email>` | Grant admin role |

Client (`cd client`):

| Command | Purpose |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run lint` | oxlint |
| `npm test` | All client tests (Vitest, no browser needed) |
| `npm run build` | Production build to `client/dist` |
| `npm run preview` | Serve the production build |

## Tests

Every feature folder has its own test file(s) next to its code.

Server (`server/features/*/*.test.js`, Vitest + supertest + socket.io-client):

| Feature | Covers |
|---|---|
| `auth` | Register, duplicate email, login, wrong password, `/me` |
| `problems` | CRUD, admin checks, hidden test cases never returned; `seed.test.js` judges every built-in problem with reference solutions (Python all 20, C++ and Java 8 each) |
| `execution` | Real Docker judge (full-program and function-style), compile error line mapping, Run result vs prints, bad input message, hidden case not leaked; `harness.test.js` covers the harness without Docker |
| `battles` | Queue, room, countdown, battle start (empty problem bank regression), ELO math, queueing again after a finished battle |
| `leaderboard` | Ordering, ranks, win rate, limit, no private fields |
| `profiles` | 404, rank, badges, no private fields, LeetCode data |
| `skills` | Scoring, XP curve, topic scores, recommendations, coach, endpoints |
| `leetcode` | Connect, sync, failures, disconnect, recommendations and their rules (fetch stubbed, no network) |
| `health` | Health response and the version rule |

Before you run server tests:

- MongoDB must run on `127.0.0.1:27017`.
- Docker must run and the sandbox images must exist (`npm run docker:build`).

Notes:

- `server/core/testSetup.js` forces `NODE_ENV=test` and the `codearena_test`
  database. Tests never touch the dev database. Rate limiters are off in tests.
- Files run one at a time (`fileParallelism: false`). Timeout is 30 s, because
  judge tests start real containers and battle tests wait through a 5 s
  countdown.

Client (`client/src/**/*.test.js`, Vitest in Node, no DOM):

- Pure helpers in each feature (formatting, filters, battle state, demo
  timeline, ladder math, validation).
- Service contracts: each service calls the right endpoint (`shared/api` is mocked).
- Cross-checks with the server source: socket event names and supported
  languages must match.
- The version rule.

Components are checked with `npm run lint`, `npm run build` and the manual
cases in each feature `README.md`.

## Manual battle check

1. Open two browser sessions (normal and private window).
2. Log in as two different users.
3. Both click Find a match.
4. Check: match found, countdown, battle start, problem loads, chat works both
   ways, timer counts down.
5. Submit a correct solution. Check: `Accepted`, winner shown, ratings updated.

## CI

`.github/workflows/ci.yml` runs on every push to `master`/`main` and every pull
request:

- Server: MongoDB service, `npm ci`, `npm run docker:build`, `npm test`.
- Client: `npm ci`, `npm run lint`, `npm test`, `npm run build`.
