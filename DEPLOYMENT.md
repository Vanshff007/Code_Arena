# Deploying CodeArena

Target: a single Ubuntu 22.04/24.04 VPS (DigitalOcean, Hetzner, EC2, etc.) with root/sudo access.

**Architecture**: MongoDB runs in Docker (via `docker-compose.yml`). The Node server runs **natively** on the host under PM2, not in its own container - it needs the `docker` CLI to spawn per-submission sandbox containers, and keeping it native avoids a host-path-vs-container-path mismatch that containerizing it would introduce (see `docker-compose.yml`'s comment for the full reasoning). Nginx serves the built client and reverse-proxies `/api` and `/socket.io` to the PM2 process, and terminates TLS.

**Scaling note**: this app runs as exactly one server instance by design - matchmaking queue and battle room state live in that process's memory (`server/features/battles/state.js`), not in a shared store. Do not run multiple instances or PM2 cluster mode; do not put this behind a load balancer with more than one backend without first moving that state into Redis.

**What I could and couldn't verify**: every command below was checked against how this app actually behaves - real Mongo, real Docker, real Socket.io - in this session (matchmaking, battle, chat, submission were all run end-to-end). I do not have a real VPS to run this exact runbook against, so treat step 10 (smoke test) as the real gate before calling a deployment done, not this document by itself.

## 1. Install prerequisites on the VPS

```bash
# Docker + Compose plugin
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER   # log out/in (or `newgrp docker`) for this to take effect

# Node 22 (NodeSource)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2 (process manager for the Node app)
sudo npm install -g pm2

# Nginx + certbot (TLS)
sudo apt-get install -y nginx certbot python3-certbot-nginx
```

Verify: `docker --version`, `docker compose version`, `node --version` (should print v22.x), `pm2 --version`.

## 2. Clone and configure

```bash
sudo mkdir -p /opt/codearena && sudo chown $USER:$USER /opt/codearena
git clone <your-repo-url> /opt/codearena
cd /opt/codearena
```

**`server/.env`** (copy from `server/.env.example` and fill in real values):
```
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/codearena
CLIENT_URL=https://your-domain.example.com
JWT_SECRET=<generate below - must be 32+ chars, the app refuses to start otherwise>
JWT_EXPIRES_IN=7d
```
Generate a secret: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

**`client/.env`** (copy from `client/.env.example`):
```
VITE_API_URL=https://your-domain.example.com/api
```

## 3. Start MongoDB

```bash
docker compose up -d
docker compose ps   # confirm the mongo container is healthy
```

Bound to `127.0.0.1:27017` only (see `docker-compose.yml`) - not reachable from outside the VPS.

## 4. Install, build sandbox images, seed problems

```bash
cd server
npm ci

# One-time (and again any time a Dockerfile under server/features/execution/images/
# changes) - the judge assumes these images already exist, it never builds
# them on demand.
npm run docker:build

# One-time, idempotent - safe to re-run on any future deploy; skips any
# problem title that already exists rather than duplicating it.
npm run seed-problems
```

## 5. Start the server with PM2

```bash
cd /opt/codearena
pm2 start deploy/ecosystem.config.js
pm2 save              # persist the process list
pm2 startup           # follow the printed instructions to survive a reboot
```

Check it's actually up: `pm2 status`, `pm2 logs codearena-server`, `curl http://127.0.0.1:5000/api/health`.

## 6. Build the client

```bash
cd /opt/codearena/client
npm ci
npm run build   # outputs to client/dist
```

## 7. Configure Nginx

```bash
sudo cp /opt/codearena/deploy/nginx.conf /etc/nginx/sites-available/codearena
sudo nano /etc/nginx/sites-available/codearena   # set server_name and root to your real domain/path
sudo ln -s /etc/nginx/sites-available/codearena /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

## 8. TLS

```bash
sudo certbot --nginx -d your-domain.example.com
```
Certbot edits the Nginx config in place to add the HTTPS server block and redirect. Renewal is automatic via the certbot systemd timer it installs.

## 9. Smoke test (do this for real, on the live domain, before calling it done)

- [ ] `https://your-domain.example.com/api/health` returns 200
- [ ] Register a real account through the UI
- [ ] Log in
- [ ] Open two browser sessions (or one normal + one incognito), log in as two different users, both click Friendly Matchmaking
- [ ] Match found -> room created -> countdown -> battle starts -> problem loads
- [ ] Chat works both directions
- [ ] Timer counts down
- [ ] Submit a correct solution -> Accepted, battle ends with a winner and updated ratings

## Redeploying after changes

```bash
cd /opt/codearena
git pull
cd server && npm ci && cd ../client && npm ci && npm run build
pm2 restart codearena-server
```

Re-run `npm run docker:build` only if a sandbox Dockerfile changed; re-run `npm run seed-problems` any time you add problems to `server/features/problems/seedProblems.js` (it will only insert the new ones).

## Logs

- App logs: `server/logs/` (daily-rotating, 14-day retention - see `server/core/utils/logger.js`)
- PM2 logs: `pm2 logs codearena-server`, or the files configured in `deploy/ecosystem.config.js`
- Nginx: `/var/log/nginx/access.log`, `/var/log/nginx/error.log`
