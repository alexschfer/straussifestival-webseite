#!/usr/bin/env bash
# Sichert die Umami-Datenbank: pg_dump, komprimiert, die letzten 14 Stände bleiben.
#
# Aufruf:  ./backup.sh            (aus beliebigem Ordner, der Pfad des Skripts zählt)
#
# Cron-Beispiel (täglich um 03:15 Uhr, als root auf der VM):
#   15 3 * * * /opt/straussi/analytics/backup.sh >> /var/log/straussi-backup.log 2>&1
#
# Einstellungen per Umgebungsvariable (optional):
#   BACKUP_DIR   Zielordner der Sicherungen (Standard: <Ordner dieses Skripts>/backups)
#   KEEP         Anzahl aufbewahrter Stände (Standard: 14)
#
# Wiederherstellen:  siehe README.md, Abschnitt "Backup und Wiederherstellung".
# Wichtig: Liegen die Sicherungen auf derselben VM, schützen sie nicht vor deren Verlust.
# Den Ordner zusätzlich regelmäßig an einen anderen Ort kopieren.

set -euo pipefail

SKRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_DIR="${BACKUP_DIR:-$SKRIPT_DIR/backups}"
KEEP="${KEEP:-14}"

mkdir -p "$BACKUP_DIR"

ZIEL="$BACKUP_DIR/umami-$(date +%Y-%m-%d_%H%M%S).sql.gz"
TEMP="$ZIEL.partial"
trap 'rm -f "$TEMP"' EXIT

# Benutzer und Datenbankname stammen aus dem Container selbst (POSTGRES_USER/POSTGRES_DB).
docker compose --project-directory "$SKRIPT_DIR" exec -T db \
  sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists' \
  | gzip -9 > "$TEMP"

# Nur behalten, wenn die Datei ein gültiges, nicht leeres Archiv ist.
gzip -t "$TEMP"
if [ ! -s "$TEMP" ] || [ "$(gzip -dc "$TEMP" | wc -c)" -lt 100 ]; then
  echo "FEHLER: Sicherung ist leer oder unvollständig, wird verworfen." >&2
  exit 1
fi
mv "$TEMP" "$ZIEL"
echo "$(date '+%Y-%m-%d %H:%M:%S') Sicherung geschrieben: $ZIEL ($(du -h "$ZIEL" | cut -f1))"

# Alte Stände löschen: die neuesten $KEEP behalten.
ls -1t "$BACKUP_DIR"/umami-*.sql.gz 2>/dev/null | tail -n +"$((KEEP + 1))" | while read -r alt; do
  rm -f -- "$alt"
  echo "Alten Stand gelöscht: $alt"
done
