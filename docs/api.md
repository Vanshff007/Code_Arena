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

- Send `Authorization: Bearer <JWT>`.
- `protect` checks the token and sets `req.user`.
- `isAdmin` requires `req.user.role === 'admin'`. The admin role is set only by
  `npm run make-admin -- <email>`, never over HTTP.

## Rate limits (`server/core/middleware/rateLimiters.js`)

| Limiter | Scope | Limit |
|---|---|---|
| `apiLimiter` | All `/api` routes, per IP | 300 per 15 min |
| `authLimiter` | Register and login | 10 per 15 min |
| `executeLimiter` | Run and submit, per user | 20 per 5 min |

## REST endpoints (prefix `/api`)

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/health` | — | Health check, includes the server `version` |
| POST | `/auth/register` | — | Create account |
| POST | `/auth/login` | — | Log in, returns JWT |
| GET | `/auth/me` | user | Current user |
| GET | `/problems` | — | List problems (`?difficulty=`, `?tag=`), light fields only |
| GET | `/problems/:id` | — | One problem (no hidden test cases), with `signature`, `outputOrder` and generated `starterCode` |
| POST | `/problems` | admin | Create problem |
| PUT | `/problems/:id` | admin | Update problem |
| DELETE | `/problems/:id` | admin | Delete problem |
| POST | `/execute/run` | user | Run code on custom input |
| POST | `/execute/submit` | user | Judge code on all test cases. Optional `roomCode` (battle) and `startedAt` |
| GET | `/leaderboard` | — | Rating leaderboard |
| GET | `/users/:username/profile` | — | Public profile, including read-only LeetCode data (top topics, languages, activity, contest history) |
| GET | `/matches/me` | user | My match history |
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

The socket connects with `io(SOCKET_URL, { auth: { token } })`. Unauthenticated
connections are rejected.

Client → server:

| Event | Payload | Purpose |
|---|---|---|
| `room:create` | — | Create a private room |
| `room:join` | `{ roomCode }` | Join a private room |
| `room:ready` | `{ roomCode }` | Mark ready. Both ready starts the countdown |
| `matchmaking:join` | — | Join the random queue |
| `matchmaking:leave` | — | Leave the queue |
| `chat:send` | `{ roomCode, message }` | Send a chat message |
| `battle:typing` | `{ roomCode }` | Typing indicator |

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
| `battle:resume` | Rejoin data after a page refresh |
| `battle:end` | Winner, draw flag, rating changes |
| `chat:message` | Chat message broadcast |

When you change an event, update the server handler, the client listener and
this table in the same change.
