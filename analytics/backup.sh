#!/usr/bin/env bash
# Backs up the Umami database: pg_dump, compressed, the last 14 versions are kept.
#
# Usage:  ./backup.sh            (from any folder, the script's own path counts)
#
# Cron example (daily at 03:15, as root on the VM):
#   15 3 * * * /opt/straussi/backup.sh >> /var/log/straussi-backup.log 2>&1
#
# Settings via environment variables (optional):
#   BACKUP_DIR   target folder for the backups (default: <folder of this script>/backups)
#   KEEP         number of versions to keep (default: 14)
#
# Restoring:  see README.md, section "Backup and restore".
# Important: backups on the same VM do not protect against losing that VM.
# Also copy the folder regularly to another place.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_DIR="${BACKUP_DIR:-$SCRIPT_DIR/backups}"
KEEP="${KEEP:-14}"

mkdir -p "$BACKUP_DIR"

TARGET="$BACKUP_DIR/umami-$(date +%Y-%m-%d_%H%M%S).sql.gz"
TEMP="$TARGET.partial"
trap 'rm -f "$TEMP"' EXIT

# User and database name come from the container itself (POSTGRES_USER/POSTGRES_DB).
docker compose --project-directory "$SCRIPT_DIR" exec -T db \
  sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists' \
  | gzip -9 > "$TEMP"

# Only keep the file if it is a valid, non-empty archive.
gzip -t "$TEMP"
if [ ! -s "$TEMP" ] || [ "$(gzip -dc "$TEMP" | wc -c)" -lt 100 ]; then
  echo "ERROR: backup is empty or incomplete, discarding it." >&2
  exit 1
fi
mv "$TEMP" "$TARGET"
echo "$(date '+%Y-%m-%d %H:%M:%S') Backup written: $TARGET ($(du -h "$TARGET" | cut -f1))"

# Delete old versions: keep the newest $KEEP.
ls -1t "$BACKUP_DIR"/umami-*.sql.gz 2>/dev/null | tail -n +"$((KEEP + 1))" | while read -r old; do
  rm -f -- "$old"
  echo "Deleted old version: $old"
done
