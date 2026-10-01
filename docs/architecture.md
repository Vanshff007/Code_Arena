# Architecture

This file describes how CodeArena is built and how the parts connect.

## Overview

CodeArena is a real-time 1v1 competitive coding platform. Two players get the
same problem. The first correct submission wins, and both ratings change (ELO).
The app also has a solo practice mode, a skill analyzer with XP, a rule-based
coach, and optional LeetCode profile sync.

The repository is a monorepo with two independent apps:

```
client/   React 19 + Vite 8 + Tailwind v4 + Monaco editor + socket.io-client
server/   Node 22 (ESM) + Express 4 + Mongoose 8 + Socket.io 4 + Docker judge
deploy/   PM2 and Nginx configuration for production
docs/     Project documentation (this folder)
```

Each app has its own `package.json`, `package-lock.json` and `.env`. There is
no root `package.json`.

Both apps are organized by **feature folder**. Each feature owns its code,
its tests and a `README.md`. Code that several features use lives in
`server/core/` or `client/src/shared/`. See `docs/contributing.md` for the
rules.

## Server

```
server/
├── server.js            # http.Server + Socket.io + DB connect
├── app.js               # Express middleware stack and route mounting
├── core/                # shared by all features
│   ├── config/          # env.js (validated env), db.js
│   ├── middleware/      # errorHandler, rateLimiters, validate
│   ├── utils/logger.js  # Winston
│   └── testSetup.js     # Vitest setup (test database)
└── features/
    ├── auth/            # users, JWT, protect/isAdmin, make-admin CLI
    ├── problems/        # problem bank, seed script
    ├── execution/       # Docker judge (engine/, images/), run/submit API
    ├── battles/         # sockets, rooms, matchmaking, ELO, match history
    ├── leaderboard/
    ├── profiles/
    ├── skills/          # skill scores, XP, recommendations, coach
    ├── leetcode/
    └── health/
```

### Boot

`server/server.js` creates an `http.Server`, attaches Socket.io to it, connects
to MongoDB, and then listens. Express and Socket.io share one port.

`server/core/config/env.js` loads `.env` and stops the process when
`MONGO_URI` or `JWT_SECRET` is missing, or when `JWT_SECRET` is shorter than
32 characters.

### Middleware stack (`server/app.js`)

1. `helmet`
2. `cors` (origins from `CLIENT_URL`, comma-separated)
3. `express.json`, `express.urlencoded`
4. `express-mongo-sanitize` (removes `$` operators from input)
5. `hpp` (removes duplicate query parameters)
6. `morgan`, written through the Winston logger
7. `apiLimiter` on `/api`
8. Feature routes
9. `notFound`, then `errorHandler`

### Inside a feature

```
<name>.routes.js  →  middleware chain  →  <name>.controller.js
                                       →  <name>.service.js
                                       →  <Name>.model.js
```

Route middleware order: `protect` → `isAdmin` (admin routes only) → rate
limiter → validator chain → `validate` → controller.

Features may import each other where the domain needs it (for example,
`execution` calls `battles` and `skills` after judging). Keep these imports
one-way and explicit.

### Submission flow

1. Client sends `POST /api/execute/submit`.
2. `execution` loads the problem with `+hiddenTestCases`.
3. `judgeSubmission` runs the code against all test cases in a sandbox
   (`docs/execution.md`).
4. If `roomCode` is present, `battles/roomManager.handleBattleSubmission`
   updates the battle.
5. `skills/performanceTracker.trackSubmission` runs the skill, XP and coach
   pipeline. Errors here are caught and logged so they never break the
   response.
6. The controller returns the verdict, plus tracking data when available.

### Real-time battles (`server/features/battles/`)

Room lifecycle: `waiting → countdown → in_progress → completed`.

- A battle lasts 15 minutes.
- A disconnected player has 20 seconds to reconnect before an automatic forfeit.
- A room becomes a persisted `Match` document only when the battle starts.
- A completed room stays in memory for 60 seconds but no longer counts as the
  player's room, so they can queue again at once.
- Battle submissions use REST, not the socket.

**Single process only.** Room and queue state live in process memory
(`state.js`). Do not run more than one server instance, PM2 cluster mode, or
a load balancer with more than one backend, unless this state first moves to
Redis.

## Client

```
client/src/
├── main.jsx, App.jsx    # providers and routes
├── index.css            # design tokens (docs/design.md)
├── shared/              # api.js, format.js, layout/, ui/, version.js
└── features/
    ├── auth/            # AuthContext, ProtectedRoute, login/register
    ├── home/            # landing page, duel demo, 404
    ├── dashboard/
    ├── problems/        # practice list and page, problem statement
    ├── execution/       # CodeWorkspace (editor, run, submit, verdict)
    ├── battles/         # socket, find battle, battle room, history
    ├── leaderboard/
    ├── profiles/
    ├── skills/
    ├── leetcode/
    └── health/
```

- `shared/api.js` is the only Axios instance. It adds the JWT from
  `localStorage['codearena_token']` and clears it on 401. Each feature has a
  `<name>Service.js` that uses it. Components never call axios directly.
- `features/battles/SocketContext.jsx` opens one socket when a user is logged
  in. The socket URL is `VITE_API_URL` without the `/api` suffix.
- `features/execution/CodeWorkspace.jsx` is shared by practice and battles.
- Routes are listed in `src/App.jsx`. Every page except home, login, register
  and 404 is wrapped in `ProtectedRoute`.
- Pure logic (formatting, filters, battle helpers, demo timeline) lives in
  plain `.js` files next to the components, so it can be tested without a DOM.
