# analytics/: web server and analytics

> **Not in use:** the site currently runs on web hosting at Cloud86 with Matomo, see [deploy/PLESK.md](../deploy/PLESK.md). This folder is the alternative for an own server.

A `docker compose` stack with three containers:

| Container | Job |
| --- | --- |
| `caddy` | HTTPS (automatic via Let's Encrypt). Serves the static website at `<domain>`, forwards `stats.<domain>` to Umami. The only container with open ports. |
| `umami` | Analytics software (self-hosted, version pinned in `docker-compose.yml`). |
| `db` | Postgres for Umami, data in the named volume `umami-db-data`. |

| File | Purpose |
| --- | --- |
| `docker-compose.yml` | the stack |
| `Caddyfile` | routing and HTTPS |
| `.env.example` | template for all settings and secrets (`.env` is never committed) |
| `.env.local.example` | template for testing on your own computer |
| `backup.sh` | nightly database backup |

The website itself (`web/dist/`) is not built in the container; it is placed as finished files in the folder `site/` next to `docker-compose.yml`. `deploy/deploy.sh` does that (see [deploy/README.md](../deploy/README.md)).

## Testing locally with Docker

Requirement: Docker with Compose. Ports 8080 and 8443 must be free.

```sh
# 1. Build the website with local addresses (in the web/ folder)
cd web
SITE_URL=https://localhost:8443 \
PUBLIC_UMAMI_HOST=https://stats.localhost:8443 \
PUBLIC_UMAMI_WEBSITE_ID=placeholder \
npm run build

# 2. Start the stack (in the analytics/ folder)
cd ../analytics
cp .env.local.example .env
docker compose up -d
docker compose ps           # after about 30 seconds: all "healthy"/"Up"
```

> `npm run build` overwrites `docs/channels.md` and `docs/qr/` with `localhost` addresses. Afterwards reset them with `git checkout docs/` and do not commit them.

Then in the browser (the warning about the self-signed certificate is normal for the local test):

- Website: <https://localhost:8443/>
- Umami: <https://stats.localhost:8443/>, login `admin` / `umami`
- QR redirect: <https://localhost:8443/q/flyer>

Opening `http://localhost:8080/` redirects locally to `https://localhost/` (without port). That is only a test artefact of the different ports; on the server with 80/443 it works. Locally, just open the `https://…:8443` address directly.

To make the ticket click arrive in Umami locally: create a website in Umami (Settings > Websites), set its ID as `PUBLIC_UMAMI_WEBSITE_ID` and rebuild the site. Cleaning up:

```sh
docker compose down        # stop, data stays
docker compose down -v     # stop AND delete all test data
```

## Running on the server

Normally `deploy/deploy.sh` takes care of everything: it copies these files to the VM, creates the `.env` with freshly generated secrets on the first run and starts the stack (procedure and requirements: [deploy/README.md](../deploy/README.md)). By hand it works like this: `cp .env.example .env`, fill in the values (secrets with `openssl rand -hex 32`), `docker compose up -d`.

**Immediately after the first start:** Umami has the default login `admin` / `umami`. Change the password before anything else happens (steps: [deploy/README.md](../deploy/README.md), section "After the first start").

Useful commands (in the `analytics/` folder):

```sh
docker compose ps                  # status
docker compose logs -f umami       # follow the logs
docker compose pull && docker compose up -d    # update the containers
```

Updating Umami: change the version tag in `docker-compose.yml` (`ghcr.io/umami-software/umami:<version>`), make a backup first, then `docker compose pull && docker compose up -d`.

Privacy note for the privacy policy: Caddy writes no access logs in this configuration. Docker logs of the containers are limited to 3 files of 10 MB each.

## Backup and restore

`backup.sh` writes a compressed backup (`umami-<date>_<time>.sql.gz`) to `analytics/backups/` and keeps the last 14. Other target or number: `BACKUP_DIR=/path KEEP=30 ./backup.sh`. On error, the script aborts with an error code and leaves the existing backups untouched.

Nightly via cron (as root on the VM, `crontab -e`):

```cron
15 3 * * * /opt/straussi/backup.sh >> /var/log/straussi-backup.log 2>&1
```

(Adjust the path to the actual location of the folder.)

**The backups are on the same VM.** If the VM fails, they are gone with it. So also copy the `backups/` folder regularly to another place (e.g. via `rsync` to another computer).

Restoring (overwrites the current Umami data):

```sh
cd analytics
docker compose stop umami
gunzip -c backups/umami-<date>_<time>.sql.gz \
  | docker compose exec -T db sh -c 'psql -q -U "$POSTGRES_USER" -d "$POSTGRES_DB" -v ON_ERROR_STOP=1'
docker compose start umami
```
