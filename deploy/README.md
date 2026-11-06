# Deploy

Production configuration. The full runbook is `DEPLOYMENT.md` (kept
private, not in the repository).

| File | Job |
|---|---|
| `ecosystem.config.js` | PM2: one server process, fork mode. Never cluster mode. |
| `nginx.conf` | Serves `client/dist`, proxies `/api` and `/socket.io` (with WebSocket upgrade). |
| `backup-mongo.sh` | Daily MongoDB backup to disk, plus an optional copy to S3. |

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
