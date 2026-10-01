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
│   ├── utils/           # logger.js (Winston), cookies.js
│   ├── io.js            # shared Socket.io instance
│   ├── socketLimits.js  # per-socket event rate limits
│   ├── presence.js      # which users are online (socket ids per user)
│   └── testSetup.js     # Vitest setup (test database)
└── features/
    ├── auth/            # users, cookie sessions, protect/isAdmin, make-admin CLI
    ├── problems/        # problem bank, editorials, admin editor API, seed script
    ├── execution/       # Docker judge (engine/, images/), run/submit API
    ├── battles/         # sockets, rooms, matchmaking, ELO, history, replays, spectators, rematch
    ├── friends/         # friend requests, online status, challenges
    ├── leaderboard/     # all-time and monthly seasons
    ├── profiles/
    ├── skills/          # skill scores, XP, recommendations, coach
    ├── leetcode/
    └── health/
```

### Boot

`server/server.js` creates an `http.Server`, attaches Socket.io to it, connects
to MongoDB, restores in-progress battles from `ActiveRoom`
(`restoreActiveBattles`), and then listens. Express and Socket.io share one port.

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

### Sessions

- Login and register set an httpOnly `ca_token` cookie (`SameSite=Lax`,
  `Secure` in production). The web app and API must be on the same site.
- The JWT holds `{ id, tv }`. `tv` must equal `User.tokenVersion`; log out
  on all devices and a password change increase it, so older tokens stop
  working. Log out on all devices also disconnects the user's sockets.
- `protect` and the socket auth read the cookie first, then a Bearer header.

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
- Problem difficulty follows the players' average rating (below 1150 Easy,
  below 1450 Medium, else Hard), with a fallback when none exists.
- In-progress battles are copied to `ActiveRoom` (on start, on each
  submission, and throttled on code snapshots) and restored at boot. The
  battle clock is based on `startedAt`, so time spent down still counts.
- One tab owns a battle. A new tab must send `battle:claim`; the old one
  gets `battle:takenOver`. A reconnecting socket only takes over if the user
  has no other live socket.
- Spectators join the `watch:<roomCode>` channel and get progress only, never
  code. Replays (snapshots + submissions in `BattleReplay`) are open to the
  two players only.
- After a battle either player may offer a rematch (45 s window).

**Single process only.** Room, queue and presence state live in process
memory (`state.js`, `core/presence.js`). Do not run more than one server instance, PM2 cluster mode, or
a load balancer with more than one backend, unless this state first moves to
Redis.

## Client

```
client/src/
├── main.jsx, App.jsx    # providers and routes
├── index.css            # design tokens (docs/design.md)
├── shared/              # api.js, format.js, layout/, ui/, version.js
└── features/
    ├── auth/            # AuthContext, ProtectedRoute, AdminRoute, login/register, settings
    ├── home/            # landing page, duel demo, 404
    ├── dashboard/
    ├── problems/        # practice list and page, problem statement
    ├── execution/       # CodeWorkspace (editor, run, submit, verdict)
    ├── battles/         # socket, find battle, battle room, history, replay, watch
    ├── friends/         # friends page, global challenge notifications
    ├── admin/           # problem list and editor
    ├── leaderboard/     # all time and seasons
    ├── profiles/
    ├── skills/
    ├── leetcode/
    └── health/
```

- `shared/api.js` is the only Axios instance. It sends the session cookie
  (`withCredentials`) and tells `AuthContext` on a 401 so the user is logged
  out. Nothing about the session is stored in `localStorage`. Each feature has a
  `<name>Service.js` that uses it. Components never call axios directly.
- `features/battles/SocketContext.jsx` opens one socket when a user is logged
  in. The socket URL is `VITE_API_URL` without the `/api` suffix.
- `shared/ThemeProvider.jsx` applies light, dark or system theme via
  `data-theme` on `<html>`; `index.html` sets it before first paint.
- `features/execution/CodeWorkspace.jsx` is shared by practice and battles.
- Routes are listed in `src/App.jsx`. Every page except home, login, register
  and 404 is wrapped in `ProtectedRoute`.
- Pure logic (formatting, filters, battle helpers, demo timeline) lives in
  plain `.js` files next to the components, so it can be tested without a DOM.
