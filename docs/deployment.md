# Deployment

The full step-by-step production runbook is `DEPLOYMENT.md` at the repo root.
This file gives the summary and the rules.

## Production setup

One Ubuntu VM. The default free setup in `DEPLOYMENT.md` uses an Oracle
Cloud Always Free Ampere (ARM) VM, a DuckDNS subdomain and a Let's Encrypt
certificate, for a total cost of $0. Any Ubuntu VPS with 2 GB RAM or more
also works. Platforms that cannot start Docker containers (Vercel, Render,
Railway, Heroku) cannot host the judge.

| Part | How it runs |
|---|---|
| MongoDB | Docker (`docker-compose.yml`), bound to `127.0.0.1:27017` |
| Node server | Natively under PM2 (`deploy/ecosystem.config.js`) |
| Sandbox containers | Started by the server through the host Docker CLI |
| Client | Static build in `client/dist`, served by Nginx |
| Nginx | `deploy/nginx.conf`. Serves the client, proxies `/api` and `/socket.io` |
| TLS | certbot (Let's Encrypt), renews automatically |
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
  `server/features/problems/seedData.js`.
- Nginx must forward WebSocket upgrade headers for `/socket.io`.
- **Keep port 5000 closed to the internet.** In production the server trusts
  one proxy hop (`trust proxy` = 1) so rate limits see the real visitor IP
  from Nginx. A client that reached port 5000 directly could fake that IP.
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

After a deploy, run the smoke test in `DEPLOYMENT.md` step 10 on the live
domain.

Ask the project owner before any change to hosting, domains, TLS, Nginx, PM2
or Docker setup.
