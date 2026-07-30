# CodeArena

Real-time 1vs1 competitive coding battle platform — two players get the same
problem, first correct submission wins.

## Monorepo layout

```
client/   React (Vite) frontend — UI, Monaco editor, Socket.io client
server/   Node/Express backend — REST API, Socket.io server, Docker-based
          code execution engine
```

Each app has its own `package.json`, dependencies, and `.env`.

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the full production runbook (single
VPS: Docker for MongoDB + the code-execution sandboxes, PM2 for the server,
Nginx + certbot for the client and TLS).

## Testing

`cd server && npm test` runs the critical-path suite (auth, problem CRUD,
matchmaking/battle flow, and the real Docker judge). CI (`.github/workflows/ci.yml`)
runs this plus a client lint/build on every push and pull request.

## Status

Project is being built incrementally. See commit history / project notes for
current progress.
