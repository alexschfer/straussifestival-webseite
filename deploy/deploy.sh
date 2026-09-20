#!/usr/bin/env bash
# Deployment auf eine einzelne Linux-VM: lokal bauen, per rsync kopieren, Container starten.
# Auf der VM läuft kein Node, nur Docker (mit Compose), rsync und SSH-Zugang.
#
#   ./deploy/deploy.sh                Bauen, kopieren, Stack aktualisieren
#   ./deploy/deploy.sh --skip-build   vorhandenes web/dist/ verwenden (nicht neu bauen)
#
# Einstellungen: deploy/deploy.env (Vorlage: deploy/deploy.env.example).
# Adresse, Umami-Host und Website-ID der Seite: web/.env (Vorlage: web/.env.example).
# Das Skript ist wiederholbar: Es kann beliebig oft laufen.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SKIP_BUILD=0

for arg in "$@"; do
  case "$arg" in
    --skip-build) SKIP_BUILD=1 ;;
    -h|--help) sed -n '2,10p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "Unbekannte Option: $arg (siehe --help)" >&2; exit 2 ;;
  esac
done

fehler() { echo "FEHLER: $*" >&2; exit 1; }
warnung() { echo "WARNUNG: $*" >&2; }
info() { echo "==> $*"; }

# --- Einstellungen laden -------------------------------------------------------
CONFIG="$ROOT/deploy/deploy.env"
if [ -f "$CONFIG" ]; then
  set -a; . "$CONFIG"; set +a
else
  [ -n "${DEPLOY_HOST:-}" ] || fehler "deploy/deploy.env fehlt. Vorlage kopieren: cp deploy/deploy.env.example deploy/deploy.env"
fi
DEPLOY_HOST="${DEPLOY_HOST:?DEPLOY_HOST fehlt in deploy/deploy.env}"
DEPLOY_USER="${DEPLOY_USER:-root}"
DEPLOY_PATH="${DEPLOY_PATH:-/opt/straussi}"
DEPLOY_SSH_PORT="${DEPLOY_SSH_PORT:-22}"
[ "$DEPLOY_HOST" != "vm.example.org" ] || fehler "In deploy/deploy.env steht noch der Beispielwert für DEPLOY_HOST."

for tool in ssh rsync curl; do
  command -v "$tool" >/dev/null || fehler "'$tool' ist nicht installiert."
done

# Wert aus der Umgebung, sonst aus web/.env (wie es auch der Astro-Build macht).
webwert() {
  local name="$1" wert="${!1:-}"
  if [ -z "$wert" ] && [ -f "$ROOT/web/.env" ]; then
    wert="$(sed -n "s/^${name}=//p" "$ROOT/web/.env" | tail -n 1 | tr -d '"' | tr -d "'")"
  fi
  printf '%s' "$wert"
}

SITE_URL="$(webwert SITE_URL)"
UMAMI_HOST="$(webwert PUBLIC_UMAMI_HOST)"
UMAMI_ID="$(webwert PUBLIC_UMAMI_WEBSITE_ID)"

# --- Prüfungen vor dem Bauen --------------------------------------------------
[ -n "$SITE_URL" ] || fehler "SITE_URL fehlt. In web/.env eintragen (z. B. SITE_URL=https://festival.example.org)."
DOMAIN="$(printf '%s' "$SITE_URL" | sed -E 's#^[a-z]+://##; s#[/:].*$##')"
case "$DOMAIN" in
  ""|*.invalid|*.example.org) fehler "SITE_URL ($SITE_URL) ist noch ein Platzhalter. Echte Domain in web/.env eintragen." ;;
esac
if [ -z "$UMAMI_HOST" ] || [ -z "$UMAMI_ID" ]; then
  warnung "PUBLIC_UMAMI_HOST oder PUBLIC_UMAMI_WEBSITE_ID fehlt in web/.env: Die Seite enthält KEIN Tracking-Skript."
  warnung "Beim ersten Deploy ist das normal (die Website-ID gibt es erst nach dem Start von Umami), siehe deploy/README.md."
elif [ "${UMAMI_HOST%/}" != "https://stats.$DOMAIN" ]; then
  warnung "PUBLIC_UMAMI_HOST ($UMAMI_HOST) ist nicht https://stats.$DOMAIN, so wie es der Caddyfile erwartet."
fi
if grep -q "url: '[^']*TODO" "$ROOT/web/src/config.ts"; then
  warnung "Die Ticket-URL in web/src/config.ts ist noch ein Platzhalter (TODO)."
fi
if grep -q "profilUrl: '[^']*TODO" "$ROOT/web/src/config.ts"; then
  warnung "Das Instagram-Profil in web/src/config.ts ist noch ein Platzhalter (TODO)."
fi

# --- Bauen --------------------------------------------------------------------
if [ "$SKIP_BUILD" -eq 0 ]; then
  command -v npm >/dev/null || fehler "npm ist nicht installiert (nur lokal nötig, nicht auf der VM)."
  info "Webseite bauen"
  (cd "$ROOT/web" && npm ci && npm run build)
  if ! git -C "$ROOT" diff --quiet -- docs 2>/dev/null; then
    info "Hinweis: docs/kanaele.md und docs/qr/ wurden mit der echten Domain neu erzeugt. Bitte committen."
  fi
fi
[ -f "$ROOT/web/dist/index.html" ] || fehler "web/dist/index.html fehlt. Ohne --skip-build erneut starten."

# --- Kopieren -----------------------------------------------------------------
ZIEL="$DEPLOY_USER@$DEPLOY_HOST"
SSH_OPTS=(-p "$DEPLOY_SSH_PORT" -o ConnectTimeout=10)
remote() { ssh "${SSH_OPTS[@]}" "$ZIEL" "$@"; }
rsync_ssh="ssh ${SSH_OPTS[*]}"
PFAD_Q="$(printf '%q' "$DEPLOY_PATH")"

info "Verbindung zu $ZIEL prüfen"
remote "command -v docker >/dev/null && docker compose version >/dev/null && command -v rsync >/dev/null" \
  || fehler "Auf der VM fehlt Docker (mit Compose-Plugin) oder rsync, oder die SSH-Verbindung klappt nicht. Siehe deploy/README.md."
remote "mkdir -p $PFAD_Q/site"

info "Konfiguration nach $DEPLOY_PATH kopieren"
# --inplace: Caddyfile wird als Einzeldatei in den Container eingebunden und muss dieselbe Datei bleiben.
rsync -az --inplace -e "$rsync_ssh" \
  "$ROOT/analytics/docker-compose.yml" \
  "$ROOT/analytics/Caddyfile" \
  "$ROOT/analytics/backup.sh" \
  "$ROOT/analytics/.env.example" \
  "$ZIEL:$DEPLOY_PATH/"

info "Webseite nach $DEPLOY_PATH/site kopieren"
# Nur der Inhalt von site/ wird ersetzt, der Ordner selbst bleibt (er ist in Caddy eingebunden).
rsync -az --delete --delay-updates -e "$rsync_ssh" "$ROOT/web/dist/" "$ZIEL:$DEPLOY_PATH/site/"

# --- .env beim ersten Mal anlegen -----------------------------------------------
if remote "test -f $PFAD_Q/.env"; then
  info ".env auf der VM ist vorhanden und bleibt unverändert"
else
  [ -n "${ACME_EMAIL:-}" ] && [ "$ACME_EMAIL" != "admin@example.org" ] \
    || fehler "Erster Deploy: ACME_EMAIL in deploy/deploy.env eintragen (für Let's-Encrypt-Hinweise)."
  info "Erster Deploy: .env auf der VM anlegen (Domain $DOMAIN, neue Geheimnisse)"
  remote "cd $PFAD_Q && DOMAIN=$(printf '%q' "$DOMAIN") ACME_EMAIL=$(printf '%q' "$ACME_EMAIL") bash -s" <<'REMOTE'
set -euo pipefail
umask 077
geheim() { openssl rand -hex 32; }
sed -e "s|^DOMAIN=.*|DOMAIN=$DOMAIN|" \
    -e "s|^ACME_EMAIL=.*|ACME_EMAIL=$ACME_EMAIL|" \
    -e "s|^POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=$(geheim)|" \
    -e "s|^APP_SECRET=.*|APP_SECRET=$(geheim)|" \
    -e "s|^TWO_FACTOR_ENCRYPTION_KEY=.*|TWO_FACTOR_ENCRYPTION_KEY=$(geheim)|" \
    .env.example > .env
chmod 600 .env
REMOTE
  echo "    Die Geheimnisse stehen nur in $DEPLOY_PATH/.env auf der VM. Eine Kopie davon sicher aufbewahren (Passwortmanager)."
fi

# --- Starten --------------------------------------------------------------------
info "Container starten bzw. aktualisieren"
remote "cd $PFAD_Q && chmod +x backup.sh && docker compose up -d --remove-orphans"
info "Caddy-Konfiguration neu laden"
remote "cd $PFAD_Q && docker compose exec -T caddy caddy reload --config /etc/caddy/Caddyfile" \
  || warnung "Caddy konnte die Konfiguration nicht neu laden. Logs: docker compose logs caddy"
remote "cd $PFAD_Q && docker compose ps"

# --- Kontrolle ------------------------------------------------------------------
if ! remote "crontab -l 2>/dev/null | grep -q backup.sh"; then
  warnung "Auf der VM ist kein nächtliches Backup eingerichtet. Cron-Zeile siehe deploy/README.md, Abschnitt \"Backup einrichten\"."
fi

info "Erreichbarkeit prüfen (das erste Zertifikat kann ein, zwei Minuten dauern)"
pruefe() {
  if curl -fsS --max-time 15 -o /dev/null "$1" 2>/dev/null; then echo "    ok: $1"; else warnung "nicht erreichbar: $1 (DNS, Ports 80/443 oder Zertifikat noch nicht bereit?)"; fi
}
pruefe "https://$DOMAIN/"
pruefe "https://stats.$DOMAIN/api/heartbeat"

info "Fertig."
if [ -z "$UMAMI_ID" ]; then
  echo "    Nächste Schritte (Umami einrichten, Website-ID eintragen, erneut deployen): deploy/README.md, Abschnitt \"Nach dem ersten Start\"."
fi
