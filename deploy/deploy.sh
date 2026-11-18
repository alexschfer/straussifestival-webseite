#!/usr/bin/env bash
# Deployment to a single Linux VM: build locally, copy via rsync, start the containers.
# No Node runs on the VM, only Docker (with Compose), rsync and SSH access.
#
#   ./deploy/deploy.sh                build, copy, update the stack
#   ./deploy/deploy.sh --skip-build   use the existing web/dist/ (do not rebuild)
#
# Settings: deploy/deploy.env (template: deploy/deploy.env.example).
# Address, Umami host and website ID of the site: web/.env (template: web/.env.example).
# The script is repeatable: it can run any number of times.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SKIP_BUILD=0

for arg in "$@"; do
  case "$arg" in
    --skip-build) SKIP_BUILD=1 ;;
    -h|--help) sed -n '2,10p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "Unknown option: $arg (see --help)" >&2; exit 2 ;;
  esac
done

fail() { echo "ERROR: $*" >&2; exit 1; }
warn() { echo "WARNING: $*" >&2; }
info() { echo "==> $*"; }

# --- Load settings -------------------------------------------------------------
CONFIG="$ROOT/deploy/deploy.env"
if [ -f "$CONFIG" ]; then
  set -a; . "$CONFIG"; set +a
else
  [ -n "${DEPLOY_HOST:-}" ] || fail "deploy/deploy.env is missing. Copy the template: cp deploy/deploy.env.example deploy/deploy.env"
fi
DEPLOY_HOST="${DEPLOY_HOST:?DEPLOY_HOST is missing in deploy/deploy.env}"
DEPLOY_USER="${DEPLOY_USER:-root}"
DEPLOY_PATH="${DEPLOY_PATH:-/opt/straussi}"
DEPLOY_SSH_PORT="${DEPLOY_SSH_PORT:-22}"
[ "$DEPLOY_HOST" != "vm.example.org" ] || fail "deploy/deploy.env still contains the example value for DEPLOY_HOST."

for tool in ssh rsync curl; do
  command -v "$tool" >/dev/null || fail "'$tool' is not installed."
done

# Value from the environment, otherwise from web/.env (just like the Astro build does).
web_value() {
  local name="$1" value="${!1:-}"
  if [ -z "$value" ] && [ -f "$ROOT/web/.env" ]; then
    value="$(sed -n "s/^${name}=//p" "$ROOT/web/.env" | tail -n 1 | tr -d '"' | tr -d "'")"
  fi
  printf '%s' "$value"
}

SITE_URL="$(web_value SITE_URL)"
UMAMI_HOST="$(web_value PUBLIC_UMAMI_HOST)"
UMAMI_ID="$(web_value PUBLIC_UMAMI_WEBSITE_ID)"

# --- Checks before building ----------------------------------------------------
[ -n "$SITE_URL" ] || fail "SITE_URL is missing. Set it in web/.env (e.g. SITE_URL=https://festival.example.org)."
DOMAIN="$(printf '%s' "$SITE_URL" | sed -E 's#^[a-z]+://##; s#[/:].*$##')"
case "$DOMAIN" in
  ""|*.invalid|*.example.org) fail "SITE_URL ($SITE_URL) is still a placeholder. Set the real domain in web/.env." ;;
esac
if [ -z "$UMAMI_HOST" ] || [ -z "$UMAMI_ID" ]; then
  warn "PUBLIC_UMAMI_HOST or PUBLIC_UMAMI_WEBSITE_ID is missing in web/.env: the site contains NO tracking script."
  warn "This is normal on the first deploy (the website ID only exists after Umami has started), see deploy/README.md."
elif [ "${UMAMI_HOST%/}" != "https://stats.$DOMAIN" ]; then
  warn "PUBLIC_UMAMI_HOST ($UMAMI_HOST) is not https://stats.$DOMAIN as the Caddyfile expects."
fi
if grep -q "url: '[^']*TODO" "$ROOT/web/src/config.ts"; then
  warn "The ticket URL in web/src/config.ts is still a placeholder (TODO)."
fi
if grep -q "profileUrl: '[^']*TODO" "$ROOT/web/src/config.ts"; then
  warn "The Instagram profile in web/src/config.ts is still a placeholder (TODO)."
fi

# --- Build ---------------------------------------------------------------------
if [ "$SKIP_BUILD" -eq 0 ]; then
  command -v npm >/dev/null || fail "npm is not installed (only needed locally, not on the VM)."
  info "Building the website"
  (cd "$ROOT/web" && npm ci && npm run build)
  if ! git -C "$ROOT" diff --quiet -- docs 2>/dev/null; then
    info "Note: docs/channels.md and docs/qr/ were regenerated with the real domain. Please commit them."
  fi
fi
[ -f "$ROOT/web/dist/index.html" ] || fail "web/dist/index.html is missing. Run again without --skip-build."

# --- Copy ----------------------------------------------------------------------
TARGET="$DEPLOY_USER@$DEPLOY_HOST"
SSH_OPTS=(-p "$DEPLOY_SSH_PORT" -o ConnectTimeout=10)
remote() { ssh "${SSH_OPTS[@]}" "$TARGET" "$@"; }
rsync_ssh="ssh ${SSH_OPTS[*]}"
REMOTE_PATH_Q="$(printf '%q' "$DEPLOY_PATH")"

info "Checking the connection to $TARGET"
remote "command -v docker >/dev/null && docker compose version >/dev/null && command -v rsync >/dev/null" \
  || fail "Docker (with the Compose plugin) or rsync is missing on the VM, or the SSH connection does not work. See deploy/README.md."
remote "mkdir -p $REMOTE_PATH_Q/site"

info "Copying the configuration to $DEPLOY_PATH"
# --inplace: the Caddyfile is mounted into the container as a single file and must remain the same file.
rsync -az --inplace -e "$rsync_ssh" \
  "$ROOT/analytics/docker-compose.yml" \
  "$ROOT/analytics/Caddyfile" \
  "$ROOT/analytics/backup.sh" \
  "$ROOT/analytics/.env.example" \
  "$TARGET:$DEPLOY_PATH/"

info "Copying the website to $DEPLOY_PATH/site"
# Only the contents of site/ are replaced; the folder itself stays (it is mounted into Caddy).
rsync -az --delete --delay-updates -e "$rsync_ssh" "$ROOT/web/dist/" "$TARGET:$DEPLOY_PATH/site/"

# --- Create .env on the first run -----------------------------------------------
if remote "test -f $REMOTE_PATH_Q/.env"; then
  info ".env on the VM exists and stays unchanged"
else
  [ -n "${ACME_EMAIL:-}" ] && [ "$ACME_EMAIL" != "admin@example.org" ] \
    || fail "First deploy: set ACME_EMAIL in deploy/deploy.env (for Let's Encrypt notices)."
  info "First deploy: creating .env on the VM (domain $DOMAIN, new secrets)"
  remote "cd $REMOTE_PATH_Q && DOMAIN=$(printf '%q' "$DOMAIN") ACME_EMAIL=$(printf '%q' "$ACME_EMAIL") bash -s" <<'REMOTE'
set -euo pipefail
umask 077
secret() { openssl rand -hex 32; }
sed -e "s|^DOMAIN=.*|DOMAIN=$DOMAIN|" \
    -e "s|^ACME_EMAIL=.*|ACME_EMAIL=$ACME_EMAIL|" \
    -e "s|^POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=$(secret)|" \
    -e "s|^APP_SECRET=.*|APP_SECRET=$(secret)|" \
    -e "s|^TWO_FACTOR_ENCRYPTION_KEY=.*|TWO_FACTOR_ENCRYPTION_KEY=$(secret)|" \
    .env.example > .env
chmod 600 .env
REMOTE
  echo "    The secrets are only in $DEPLOY_PATH/.env on the VM. Keep a copy somewhere safe (password manager)."
fi

# --- Start ----------------------------------------------------------------------
info "Starting or updating the containers"
remote "cd $REMOTE_PATH_Q && chmod +x backup.sh && docker compose up -d --remove-orphans"
info "Reloading the Caddy configuration"
remote "cd $REMOTE_PATH_Q && docker compose exec -T caddy caddy reload --config /etc/caddy/Caddyfile" \
  || warn "Caddy could not reload its configuration. Logs: docker compose logs caddy"
remote "cd $REMOTE_PATH_Q && docker compose ps"

# --- Verification ---------------------------------------------------------------
if ! remote "crontab -l 2>/dev/null | grep -q backup.sh"; then
  warn "No nightly backup is set up on the VM. For the cron line see deploy/README.md, section \"Setting up backups\"."
fi

info "Checking reachability (the first certificate can take a minute or two)"
check_url() {
  if curl -fsS --max-time 15 -o /dev/null "$1" 2>/dev/null; then echo "    ok: $1"; else warn "not reachable: $1 (DNS, ports 80/443 or certificate not ready yet?)"; fi
}
check_url "https://$DOMAIN/"
check_url "https://stats.$DOMAIN/api/heartbeat"

info "Done."
if [ -z "$UMAMI_ID" ]; then
  echo "    Next steps (set up Umami, enter the website ID, deploy again): deploy/README.md, section \"After the first start\"."
fi
