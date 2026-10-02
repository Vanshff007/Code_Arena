# API

This file lists the REST endpoints and Socket.io events. Keep it in sync with
the route and socket files in `server/features/`, and the client feature services.

## Response format

Success:

```json
{ "success": true, "message": "optional", "data": { } }
```

Error:

```json
{ "success": false, "message": "Human-readable error" }
```

Validation failure (HTTP 400, from `server/core/middleware/validate.js`):

```json
{ "success": false, "message": "Validation failed", "errors": [{ "field": "email", "message": "..." }] }
```

The client reads all three shapes through `client/src/shared/getErrorMessage.js`.

Status codes used: 200, 201, 400, 401, 403, 404, 409 (duplicate, for example
Mongo error `11000`), 429 (rate limit), 503 (judge queue full), 500.

## Authentication

- The browser session is an httpOnly cookie, `ca_token` (`SameSite=Lax`,
  `Secure` in production), set by register and login and cleared by logout.
  The web app and the API must therefore be on the **same site**.
- API clients and tests may send `Authorization: Bearer <JWT>` instead. The
  cookie is checked first (`server/features/auth/session.js`).
- The JWT carries the user's `tokenVersion`. Log out on all devices and a
  password change increase it, which revokes every older token.
- `protect` checks the token and sets `req.user`.
- `isAdmin` requires `req.user.role === 'admin'`. The admin role is set only by
  `npm run make-admin -- <email>`, never over HTTP.

## Rate limits (`server/core/middleware/rateLimiters.js`)

| Limiter | Scope | Limit |
|---|---|---|
| `apiLimiter` | All `/api` routes, per IP | 300 per 15 min |
| `authLimiter` | Register, login and password change | 10 per 15 min |
| `executeLimiter` | Run, submit, and admin problem create/update/check, per user | 20 per 5 min |

Per-IP limits use `req.ip`. In production the app trusts one proxy hop
(`trust proxy` = 1, set from `env.trustProxy` in `server/core/config/env.js`),
so `req.ip` is the visitor's IP from Nginx's `X-Forwarded-For`. In other
environments the header is ignored.

Socket events have their own per-socket limits in
`server/core/socketLimits.js` (for example `chat:send` 5 per 10 s,
`friend:challenge` 5 per 30 s, others 20 per 10 s by default). Events over
the limit are dropped; a dropped `chat:send` gets `chat:rateLimited`.

## REST endpoints (prefix `/api`)

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/health` | — | Health check, includes the server `version` |
| POST | `/auth/register` | — | Create account |
| POST | `/auth/login` | — | Log in, sets the cookie, returns `{ token, user }` |
| GET | `/auth/me` | user | Current user |
| POST | `/auth/logout` | — | Clear the session cookie |
| POST | `/auth/logout-all` | user | Revoke every session and disconnect the user's sockets |
| PUT | `/auth/password` | user | Change password (`currentPassword`, `newPassword`); revokes other sessions and starts a new one |
| GET | `/problems` | — | List problems (`?difficulty=`, `?tag=`), light fields only |
| GET | `/problems/:id` | — | One problem (no hidden test cases, no editorial), with `signature`, `outputOrder` and generated `starterCode` |
| GET | `/problems/:id/editorial` | user | Approach and solutions. 403 while the user is in a live battle on it. Records an `EditorialView` |
| POST | `/problems/check` | admin | Judge a draft's reference solution on its tests, nothing saved |
| GET | `/problems/:id/admin` | admin | Problem for the editor: editorial included, hidden tests as `hiddenCount` only |
| POST | `/problems` | admin | Create problem. Requires a `referenceSolution` that passes every test (422 if not) |
| PUT | `/problems/:id` | admin | Update problem. A `referenceSolution` is required when tests, signature or output order change. `signature: null` removes the signature |
| DELETE | `/problems/:id` | admin | Delete problem |
| POST | `/execute/run` | user | Run code on custom input |
| POST | `/execute/submit` | user | Judge code on all test cases. Optional `roomCode` (battle) and `startedAt` |
| GET | `/leaderboard` | — | Rating leaderboard |
| GET | `/leaderboard/seasons` | — | Monthly seasons that have battles, newest first (`YYYY-MM`) |
| GET | `/leaderboard/seasons/:season` | — | Season ranking by rating points gained that month (no rating reset) |
| GET | `/users/:username/profile` | — | Public profile, including read-only LeetCode data (top topics, languages, activity, contest history) |
| GET | `/matches/me` | user | My match history, with `hasReplay` per match |
| GET | `/matches/live` | user | Live battles that can be watched |
| GET | `/matches/:id/replay` | user | Code snapshots and submissions of a finished battle. Players of that battle only (403 otherwise) |
| GET | `/friends` | user | Friends (with `online` and `inBattle`), incoming and outgoing requests |
| POST | `/friends/requests` | user | Send a request (`{ username }`). Accepts at once if they already asked you |
| POST | `/friends/requests/:id/accept` | user | Accept an incoming request |
| DELETE | `/friends/requests/:id` | user | Decline an incoming or cancel an outgoing request |
| DELETE | `/friends/:userId` | user | Remove a friend |
| POST | `/leetcode/connect` | user | Link LeetCode username |
| POST | `/leetcode/disconnect` | user | Unlink LeetCode |
| POST | `/leetcode/sync` | user | Sync LeetCode stats |
| GET | `/leetcode/recommendations` | user | LeetCode problems to practice, by topic (links). 400 if not connected, 502 if LeetCode is down |
| GET | `/skills/me` | user | My skill profile |
| GET | `/skills/xp` | user | My XP per topic |
| GET | `/skills/recommendations` | user | Recommended problems |
| GET | `/skills/feedback` | user | Coach feedback history |

Execute body: `{ language: 'cpp' | 'java' | 'python', code, input?, problemId? }`
for run, and `{ language, code, problemId, roomCode?, startedAt? }` for
submit. For function-style problems `code` is only the `Solution` class and
`input` is one JSON value per parameter per line (`docs/execution.md`).

Run response: `{ status, stdout, stderr, result? }`. `result` is the
returned value (JSON text) for function-style problems; `stdout` is what the
player printed. Submit response: `{ verdict, passedCount, totalCount,
runtimeMs, memoryKb, failedCase?, compileError?, scoreAwarded, xpAwarded,
coaching }`. `failedCase` has `input`, `expectedOutput`, `actualOutput`
(and `stdout`, `stderr`) only for a failing **public** case.

LeetCode recommendations response:
`{ topics: [{ topic, reason, difficulty, problems: [{ title, slug, difficulty, acceptance, url }] }] }`.

**Never** return `hiddenTestCases` content in any response. See
`docs/execution.md`.

## Socket.io events

The socket connects with `io(SOCKET_URL, { withCredentials: true })` and is
authenticated by the `ca_token` cookie (or `auth.token` for API clients).
Unauthenticated connections are rejected. Each user's sockets also join a
room named after the user id, used for friend and rematch notifications.

Client → server:

| Event | Payload | Purpose |
|---|---|---|
| `room:create` | — | Create a private room |
| `room:join` | `{ roomCode }` | Join a private room (a player rejoining takes the battle over) |
| `room:ready` | `{ roomCode }` | Mark ready. Both ready starts the countdown |
| `battle:claim` | `{ roomCode }` | This tab takes over the battle from the user's other tabs |
| `matchmaking:join` | — | Join the random queue |
| `matchmaking:leave` | — | Leave the queue |
| `chat:send` | `{ roomCode, message }` | Send a chat message |
| `battle:typing` | `{ roomCode }` | Typing indicator |
| `battle:snapshot` | `{ roomCode, code, language }` | Code snapshot for the replay (every 5 s while the code changes; capped size and count) |
| `rematch:request` | `{ roomCode }` | Offer a rematch after the battle (45 s window) |
| `rematch:accept` | `{ roomCode }` | Accept the offer, starts a new battle |
| `rematch:decline` | `{ roomCode }` | Decline the offer |
| `spectate:join` | `{ roomCode }` | Watch a live battle (progress only, no code) |
| `spectate:leave` | `{ roomCode }` | Stop watching |
| `friend:challenge` | `{ userId }` | Challenge an online friend; creates a private room |
| `friend:challengeDecline` | `{ fromId, roomCode }` | Decline a friend's challenge |

Server → client:

| Event | Purpose |
|---|---|
| `room:created` | `{ roomCode }` for the new room |
| `room:state` | Full room state broadcast |
| `room:error` | `{ message }` |
| `room:countdown` | `{ secondsLeft }` before the battle |
| `matchmaking:waiting` | Player is in the queue |
| `matchmaking:found` | `{ roomCode }` match found |
| `battle:start` | Battle started, includes the problem |
| `battle:timerSync` | `{ remainingMs }` |
| `battle:opponentSubmitted` | Opponent's verdict summary |
| `battle:opponentTyping` | Opponent is typing |
| `battle:opponentDisconnected` | `{ graceMs }` |
| `battle:opponentReconnected` | Opponent is back |
| `battle:resume` | Rejoin data after a page refresh or takeover |
| `battle:takenOver` | `{ roomCode }` another tab of this user took the battle |
| `battle:end` | Winner, draw flag, rating changes, `roomCode`, `matchId` |
| `chat:message` | Chat message broadcast |
| `chat:rateLimited` | `{ message }` chat message dropped |
| `rematch:pending` | `{ roomCode }` your offer was sent |
| `rematch:requested` | `{ roomCode, from }` opponent offers a rematch |
| `rematch:declined` | `{ roomCode, by }` |
| `rematch:unavailable` | `{ message }` offer expired or a player is busy |
| `rematch:start` | `{ roomCode }` the rematch room is ready |
| `spectate:state` | Spectator view: players, progress, timer, no code |
| `spectate:error` | `{ message }` |
| `battle:progress` | To spectators: `{ userId, verdict, passedCount, totalCount }` |
| `battle:typing` | To spectators: `{ userId }` is typing |
| `friend:request` | `{ username }` sent you a friend request |
| `friend:accepted` | `{ username }` accepted your request |
| `friend:challenged` | `{ roomCode, from, fromId }` |
| `friend:challengeSent` | `{ roomCode }` |
| `friend:challengeDeclined` | `{ roomCode, by }` |
| `friend:challengeError` | `{ message }` (not a friend, offline, or in a battle) |

Spectators get the players' code only after the battle, through the replay,
and only if they played in it.

When you change an event, update the server handler, the client listener and
this table in the same change.
