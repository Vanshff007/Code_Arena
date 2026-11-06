# Deploy

Production configuration. The full runbook is `DEPLOYMENT.md` (kept
private, not in the repository).

| File | Job |
|---|---|
| `ecosystem.config.js` | PM2: one server process, fork mode. Never cluster mode. |
| `nginx.conf` | Serves `client/dist`, proxies `/api` and `/socket.io` (with WebSocket upgrade). |
| `backup-mongo.sh` | Daily MongoDB backup to disk, plus an optional copy to S3. |

## Error tracking (Sentry)

1. Create a free account at <https://sentry.io> and two projects: Node.js
   (server) and React (client). Turn on email alerts for new issues.
2. On the server, add the Node project's DSN to `server/.env`:
   `SENTRY_DSN=https://...`. Add the React project's DSN to `client/.env`:
   `VITE_SENTRY_DSN=https://...`.
3. Rebuild the client (`cd client && npm run build`) and run
   `pm2 restart codearena-server`.

Leave both empty to keep error tracking off. Request bodies (code,
passwords), headers and cookies are removed before anything is sent.

## Password reset email (Gmail)

1. On the Gmail account that sends the emails, turn on 2-step
   verification, then create an app password (Google account → Security →
   App passwords).
2. In `server/.env` on the server:
   ```
   SMTP_USER=you@gmail.com
   SMTP_PASS=<16-character app password>
   MAIL_FROM=CodeArena <you@gmail.com>
   ```
3. `pm2 restart codearena-server`, then try "Forgot password?" on the live
   site with your own account.

Without these settings the forgot password page still answers, but no
email is sent (the server log shows a warning). Gmail allows about 500
emails a day.

## Backups

`backup-mongo.sh` runs `mongodump` inside the `codearena-mongo` container,
writes `/opt/codearena/backups/codearena-<UTC time>.archive.gz`, deletes
archives older than 7 days, and copies the new archive to S3 when
`S3_BUCKET` is set. A failed dump exits non-zero and leaves no archive.

Settings (environment variables): `BACKUP_DIR` (default
`/opt/codearena/backups`), `KEEP_DAYS` (7), `S3_BUCKET` (empty = disk only),
`CONTAINER` (`codearena-mongo`), `DB_NAME` (`codearena`).

### One-time setup on the server

1. **S3 bucket** (AWS console, same region as the instance,
   `ap-southeast-2`): create a private bucket, for example
   `codearena-backups-<something unique>`. Under Management, add a
   lifecycle rule that deletes objects under `mongo/` after 30 days.
2. **IAM role**: create a role for EC2 with this policy (replace the bucket
   name), then attach it to the instance (Actions → Security → Modify IAM
   role). No access keys are stored on the server.
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       { "Effect": "Allow", "Action": ["s3:PutObject"], "Resource": "arn:aws:s3:::BUCKET/mongo/*" },
       { "Effect": "Allow", "Action": ["s3:GetObject", "s3:ListBucket"], "Resource": ["arn:aws:s3:::BUCKET", "arn:aws:s3:::BUCKET/mongo/*"] }
     ]
   }
   ```
3. **AWS CLI** on the server: `sudo snap install aws-cli --classic`, then
   check with `aws s3 ls s3://BUCKET`.
4. **First run**:
   ```bash
   cd /opt/codearena && git pull
   S3_BUCKET=BUCKET bash deploy/backup-mongo.sh
   ```
   Expect "Backup written" and "Copied to s3://...".
5. **Cron** (`crontab -e` as the deploy user, who is in the `docker`
   group). Daily at 03:00 UTC:
   ```
   0 3 * * * S3_BUCKET=BUCKET /bin/bash /opt/codearena/deploy/backup-mongo.sh >> /opt/codearena/logs/backup.log 2>&1
   ```

### Restore

Overwrites the collections in the archive. Stop the server first so no
battle writes in between:

```bash
pm2 stop codearena-server
aws s3 cp s3://BUCKET/mongo/<archive> /tmp/   # or use one in /opt/codearena/backups
gunzip -c /tmp/<archive> | docker exec -i codearena-mongo mongorestore --archive --drop
pm2 start codearena-server
```

### Restore check (do this once, then every few months)

Restores into a scratch database without touching the live one:

```bash
gunzip -c <archive> | docker exec -i codearena-mongo mongorestore --archive \
  --nsFrom 'codearena.*' --nsTo 'restorecheck.*'
docker exec codearena-mongo mongosh --quiet restorecheck --eval 'db.users.countDocuments()'
docker exec codearena-mongo mongosh --quiet restorecheck --eval 'db.dropDatabase()'
```

The user count should match the live site.
