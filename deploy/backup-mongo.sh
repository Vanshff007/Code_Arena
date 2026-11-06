#!/usr/bin/env bash
# Daily MongoDB backup. Dumps the database from the Mongo container to a
# gzipped archive, keeps the last KEEP_DAYS days on disk and, when S3_BUCKET
# is set, copies each archive to S3 (the EC2 instance role grants access, so
# no keys live on the server). Run from cron; see DEPLOYMENT.md, "Backups".
#
# Restore (overwrites the collections in the archive):
#   gunzip -c <archive> | docker exec -i codearena-mongo mongorestore --archive --drop
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/opt/codearena/backups}"
KEEP_DAYS="${KEEP_DAYS:-7}"
S3_BUCKET="${S3_BUCKET:-}"
CONTAINER="${CONTAINER:-codearena-mongo}"
DB_NAME="${DB_NAME:-codearena}"

mkdir -p "$BACKUP_DIR"
file="$BACKUP_DIR/$DB_NAME-$(date -u +%Y-%m-%dT%H%M%SZ).archive.gz"

# Write to a temp name first so a failed dump never looks like a good backup.
trap 'rm -f "$file.tmp"' EXIT
docker exec "$CONTAINER" mongodump --quiet --db "$DB_NAME" --archive | gzip > "$file.tmp"
gzip -t "$file.tmp"
mv "$file.tmp" "$file"
echo "Backup written: $file ($(du -h "$file" | cut -f1))"

find "$BACKUP_DIR" -name "$DB_NAME-*.archive.gz" -mtime +"$KEEP_DAYS" -delete

if [ -n "$S3_BUCKET" ]; then
  aws s3 cp "$file" "s3://$S3_BUCKET/mongo/$(basename "$file")" --only-show-errors
  echo "Copied to s3://$S3_BUCKET/mongo/"
fi
