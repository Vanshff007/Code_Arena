# Deployment

The full step-by-step production runbook is `DEPLOYMENT.md` at the repo root.
This file gives the summary and the rules.

## Production setup

One Ubuntu VPS:

| Part | How it runs |
|---|---|
| MongoDB | Docker (`docker-compose.yml`), bound to `127.0.0.1:27017` |
| Node server | Natively under PM2 (`deploy/ecosystem.config.js`) |
| Sandbox containers | Started by the server through the host Docker CLI |
| Client | Static build in `client/dist`, served by Nginx |
| Nginx | `deploy/nginx.conf`. Serves the client, proxies `/api` and `/socket.io` |
| TLS | certbot |
| Logs | `server/logs/` (Winston, daily rotation, 14 days), PM2 logs, Nginx logs |

## Rules

- **One server process only.** PM2 config uses `instances: 1` and
  `exec_mode: 'fork'`. Battle and queue state is in memory. Do not use cluster
  mode, more instances or a load balancer with more than one backend.
- **Do not containerize the Node server.** The judge bind-mounts host paths
  into sandbox containers. Inside a container, those paths would not match.
- Run `npm run docker:build` on the server after any Dockerfile change in
  `server/features/execution/images/`.
- Run `npm run seed-problems` after adding problems to
  `server/features/problems/seedProblems.js`.
- Nginx must forward WebSocket upgrade headers for `/socket.io`.
- **Serve the client and the API from the same site** (same domain, or
  subdomains of one domain). The session is a `SameSite=Lax` httpOnly
  cookie, so a client on another site cannot log in. `NODE_ENV=production`
  marks the cookie `Secure`, so production needs HTTPS.
- In-progress battles are restored after `pm2 restart` (from `ActiveRoom`).
  Players in a lobby or the queue must start again.
- Never commit `.env` files. Production secrets stay on the server.

## Redeploy

```bash
cd /opt/codearena
git pull
cd server && npm ci && cd ../client && npm ci && npm run build
pm2 restart codearena-server
```

After a deploy, run the smoke test in `DEPLOYMENT.md` section 9 on the live
domain.

Ask the project owner before any change to hosting, domains, TLS, Nginx, PM2
or Docker setup.
