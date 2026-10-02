# Deploying CodeArena

This guide puts CodeArena on the internet for **$0**, using one free cloud
server. It takes about an hour the first time.

> **Status:** this runbook has not yet been run on a real server. The smoke
> test in step 10 is the real check that a deployment works.

## The short version

You need three things:

| What | Free option used here | Why |
|---|---|---|
| A Linux server that can run Docker | Oracle Cloud "Always Free" VM | The judge starts a Docker container for every submission |
| A domain name | DuckDNS subdomain (`yourname.duckdns.org`) | Needed for HTTPS |
| An HTTPS certificate | Let's Encrypt (certbot) | Login uses a `Secure` cookie, which only works over HTTPS |

Everything runs on that one server:

```
Browser ──HTTPS──▶ Nginx ──┬─▶ client/dist (static React build)
                           └─▶ /api, /socket.io ─▶ Node server (PM2)
                                                    ├─▶ MongoDB (Docker)
                                                    └─▶ sandbox containers (Docker)
```

### Why not Vercel, Render, Railway or Heroku?

Their free tiers cannot start Docker containers, so the judge cannot run code
there. CodeArena needs a real virtual machine (VM).

### Other ways to get a server

- **GitHub Student Developer Pack:** free credit for DigitalOcean or Azure. It
  works if you are a student.
- **A small paid VPS:** about $4–6 a month (Hetzner, DigitalOcean, Vultr).
  Pick Ubuntu 24.04 with 2 GB RAM or more, then start at step 3.
- **Google Cloud e2-micro (free):** too small. It has 1 GB RAM, which is not
  enough for MongoDB plus the Java judge.

---

## 1. Create the free Oracle Cloud server

1. Sign up at <https://www.oracle.com/cloud/free/>. Oracle asks for a card to
   verify you, but Always Free resources are not charged. Pick a home region
   near your players. You cannot change it later.
2. Open **Compute → Instances → Create instance**:
   - **Image:** Canonical Ubuntu 24.04.
   - **Shape:** Ampere `VM.Standard.A1.Flex` (ARM). Give it 2 OCPU and 12 GB
     memory. The free limit is 4 OCPU and 24 GB in total.
   - **SSH keys:** choose "Generate a key pair" and download the private key.
   - **Boot volume:** 50 GB is enough. The free limit is 200 GB.
3. If you see **"Out of capacity"**, try again later, choose another
   availability domain, or ask for fewer OCPUs. This is common on the free tier.
4. Copy the instance's **public IP address**.

> Oracle may reclaim Always Free VMs that stay almost idle for 7 days. A live
> game server is normally busy enough. Check Oracle's current Always Free terms.

### Open ports 80 and 443

Oracle blocks web traffic in **two** places. You must open both.

1. **In the Oracle console:** Instance → Subnet → Security List → **Add
   Ingress Rules**. Source `0.0.0.0/0`, TCP, destination ports `80,443`.
2. **On the server itself** (after step 3 below):

   ```bash
   sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
   sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
   sudo netfilter-persistent save
   ```

## 2. Get a free domain

1. Sign in at <https://www.duckdns.org>.
2. Create a subdomain, for example `codearena-yourname`.
3. Set its IP to your server's public IP and click **update ip**.

Your domain is now `codearena-yourname.duckdns.org`. The steps below call it
`$DOMAIN`.

> If you own a real domain, add an `A` record that points to the server's IP
> and use that domain instead.

## 3. Connect to the server

On your own computer:

```bash
ssh -i path/to/private.key ubuntu@<server-ip>
```

On the server, save your domain in a variable so you can paste the commands
that follow:

```bash
export DOMAIN=codearena-yourname.duckdns.org
```

## 4. Install the software

```bash
# Docker (runs MongoDB and the sandbox containers)
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker                       # use Docker without sudo in this shell

# Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2 keeps the Node server running and restarts it after a reboot
sudo npm install -g pm2

# Nginx (web server) and certbot (free HTTPS certificates)
sudo apt-get install -y nginx certbot python3-certbot-nginx
```

Check: `docker --version`, `docker compose version`, `node --version`
(v22.x) and `pm2 --version` all print a version.

## 5. Download the code and set secrets

```bash
sudo mkdir -p /opt/codearena && sudo chown $USER:$USER /opt/codearena
git clone <your-repo-url> /opt/codearena
cd /opt/codearena
```

Create `server/.env`. This command fills in your domain and generates a
random secret:

```bash
cat > server/.env <<EOF
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/codearena
CLIENT_URL=https://$DOMAIN
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(48).toString('hex'))")
JWT_EXPIRES_IN=7d
EOF
```

Create `client/.env`:

```bash
echo "VITE_API_URL=https://$DOMAIN/api" > client/.env
```

Never commit these `.env` files.

## 6. Start MongoDB, build the judge, add problems

```bash
cd /opt/codearena
docker compose up -d                # starts MongoDB on 127.0.0.1:27017 only
docker compose ps                   # the mongo container should be "running"

cd server
npm ci
npm run docker:build                # builds the C++, Java and Python sandbox images (takes a few minutes)
npm run seed-problems               # adds the built-in problems
```

All images used here also exist for ARM, so they build on the Oracle Ampere
VM.

## 7. Start the server

```bash
cd /opt/codearena
pm2 start deploy/ecosystem.config.js
pm2 save
pm2 startup                         # run the command it prints, so the server survives a reboot
```

Check: `curl http://127.0.0.1:5000/api/health` returns a response.
`pm2 logs codearena-server` shows the logs.

## 8. Build the website

```bash
cd /opt/codearena/client
npm ci
npm run build                       # output goes to client/dist
```

## 9. Set up Nginx and HTTPS

```bash
sudo sed "s/your-domain.example.com/$DOMAIN/" /opt/codearena/deploy/nginx.conf \
  | sudo tee /etc/nginx/sites-available/codearena > /dev/null
sudo ln -sf /etc/nginx/sites-available/codearena /etc/nginx/sites-enabled/codearena
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

sudo certbot --nginx -d $DOMAIN     # gets a certificate and turns on HTTPS
```

Certbot renews the certificate automatically.

## 10. Smoke test

Do this on the live site before you call the deployment done:

- [ ] `https://$DOMAIN/api/health` returns 200.
- [ ] Register an account and log in.
- [ ] Make yourself admin: `cd /opt/codearena/server && npm run make-admin -- you@example.com`.
- [ ] Open a normal window and a private window. Log in as two different users.
- [ ] Both click Friendly Matchmaking. A match is found, the countdown runs and the problem loads.
- [ ] Chat works in both directions. The timer counts down.
- [ ] Submit a correct solution. The verdict is Accepted, the battle ends and ratings change.

---

## Updating the site

```bash
cd /opt/codearena
git pull
cd server && npm ci
cd ../client && npm ci && npm run build
pm2 restart codearena-server
```

Also run, only when needed:

- `npm run docker:build` (in `server/`) if a Dockerfile in
  `server/features/execution/images/` changed.
- `npm run seed-problems` (in `server/`) if problems were added to
  `server/features/problems/seedData.js`. It adds only new problems. Use
  `npm run seed-problems -- --update` to also overwrite changed built-in
  problems.

Battles in progress survive `pm2 restart`. Players in a lobby or the queue
must start again.

## Rules that must not change

- **Run exactly one server process.** Battle and queue state lives in memory.
  Keep `instances: 1` and `exec_mode: 'fork'` in `deploy/ecosystem.config.js`.
  No PM2 cluster mode and no load balancer with several backends.
- **Do not put the Node server in Docker.** The judge mounts host folders into
  the sandbox containers. Inside a container, those paths would not match.
- **Serve the website and the API from the same site.** The login cookie does
  not work across sites. The Nginx setup above already does this.
- **Use HTTPS.** In production the login cookie is `Secure`.
- **Keep port 5000 closed to the internet.** Open only ports 80 and 443. The
  server trusts Nginx to report each visitor's IP; a client that reached
  port 5000 directly could fake its IP and dodge the rate limits.

## Troubleshooting

| Problem | Check |
|---|---|
| Site does not load at all | Both firewalls from step 1 are open, and DuckDNS points to the right IP |
| `certbot` fails | Port 80 is open and `$DOMAIN` resolves to the server (`ping $DOMAIN`) |
| Login works but you are logged out at once | The site is on HTTPS, and `CLIENT_URL` matches the address in the browser exactly |
| Live updates are slow or battles do not sync | The `/socket.io/` block in the Nginx config is present (WebSocket headers) |
| Every submission fails | `docker images` lists `codearena-cpp`, `codearena-java` and `codearena-python`. If not, run `npm run docker:build` |
| `permission denied` on Docker | Log out and back in after `usermod -aG docker` |
| Server keeps restarting | `pm2 logs codearena-server`. A `JWT_SECRET` shorter than 32 characters stops startup |

## Logs

- App: `server/logs/` (rotates daily, kept 14 days)
- PM2: `pm2 logs codearena-server`
- Nginx: `/var/log/nginx/access.log` and `/var/log/nginx/error.log`
