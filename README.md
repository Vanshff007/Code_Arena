# CodeArena

Real-time 1vs1 competitive coding battle platform — two players get the same
problem, first correct submission wins.

## Monorepo layout

```
client/   React (Vite) frontend — UI, Monaco editor, Socket.io client
server/   Node/Express backend — REST API, Socket.io server, Docker-based
          code execution engine
```

Each app has its own `package.json`, dependencies, and `.env` — they are
deployed independently (client -> Vercel, server -> Docker-capable VPS).

## Status

Project is being built incrementally. See commit history / project notes for
current progress.
