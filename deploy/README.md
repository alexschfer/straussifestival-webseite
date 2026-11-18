# deploy/: getting the website and analytics onto a VM

> **Not in use:** the site currently runs on web hosting at Cloud86 with Matomo, see [PLESK.md](PLESK.md). This folder is the alternative for an own server.

The target is a single Linux VM (planned: Selfnet e. V.). **No Node** runs on the VM: the site is built on your computer and copied as finished files. Nothing here is tied to a provider; for a switch (e.g. to Hetzner) only `DEPLOY_HOST` changes, see [Switching providers](#switching-providers).

```
Your computer                                  VM
web/  --npm run build--> web/dist/  --rsync--> /opt/straussi/site/     (served by Caddy)
analytics/ (Compose, Caddyfile, backup.sh) --> /opt/straussi/          (docker compose up -d)
```

`./deploy/deploy.sh` does everything. It can be repeated as often as you like.

## Requirements

**On your computer:** Node.js 22.12 or newer (only for building), `ssh`, `rsync`, `curl`, Git.

**On the VM:**

- Root access via SSH (with an SSH key), e.g. `ssh root@<vm>`. Another user works if it may use Docker without sudo and write to `DEPLOY_PATH`.
- Docker with the Compose plugin (`docker compose version` must work). Installation: <https://docs.docker.com/engine/install/>
- `rsync` (e.g. `apt install rsync`).
- Reachable ports: 22 (SSH), 80 and 443 (TCP) and 443 (UDP, for HTTP/3). Open them if the provider has a firewall. Port 80 is needed for the certificates.
- Two **DNS records** pointing to the VM's IP (A, plus AAAA for IPv6): `<domain>` and `stats.<domain>`. **They must resolve before the stack starts for the first time**, otherwise Caddy cannot get a certificate.

> **Open:** VM, domain and DNS come from Selfnet (request pending, see `docs/SPEC.md`). A domain that belongs to the association and does not depend on the provider makes sense: it is on all printed QR codes and should not change when switching providers.

## One-time setup

1. **Set the site's addresses locally** (`web/.env`, template `web/.env.example`):

   ```sh
   cp web/.env.example web/.env
   ```

   Enter: `SITE_URL=https://<domain>` and `PUBLIC_UMAMI_HOST=https://stats.<domain>`. Leave `PUBLIC_UMAMI_WEBSITE_ID` empty for now; the ID only exists after the first start (see below).

2. **Set the VM credentials locally** (`deploy/deploy.env`, not committed):

   ```sh
   cp deploy/deploy.env.example deploy/deploy.env
   ```

   Enter: `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_PATH` (default `/opt/straussi`), `ACME_EMAIL`.

3. Enter the **ticket URL** in `web/src/config.ts` once it is known. The script warns as long as it still contains `TODO`.

## First deploy

```sh
./deploy/deploy.sh
```

The script

1. checks the settings (aborts if `SITE_URL` is still a placeholder),
2. builds the site (`npm ci`, `npm run build`),
3. checks via SSH whether Docker and rsync are present on the VM,
4. copies the Compose file, Caddyfile and `backup.sh` to `DEPLOY_PATH` and the site to `DEPLOY_PATH/site/`,
5. on the first run creates the `.env` on the VM, with `DOMAIN` and `ACME_EMAIL` and **freshly generated secrets** (they exist only there, never in the repo),
6. starts the stack (`docker compose up -d`), reloads the Caddy configuration and checks whether the site and Umami are reachable.

The build also regenerates `docs/channels.md` and `docs/qr/` with the real domain. **Commit these changes**; then the QR codes in the repo are ready to print.

The secrets are only in `<DEPLOY_PATH>/.env` on the VM. **Keep a copy in the password manager.**

The certificate can take a minute or two. If the script reports "not reachable" at the end, wait a moment and check in the browser; if it persists, see [Troubleshooting](#troubleshooting).

## After the first start

Umami is now reachable at `https://stats.<domain>`, with the default login that everybody knows. So the first step, **immediately**:

1. **Change the admin password.** Log in with user `admin` and password `umami`, then set a new, long password in the profile/account settings. Only then continue. Put the new password into the password manager.
2. **Create the website.** In Umami under "Settings" > "Websites" > "Add website": name e.g. "Straussi Festival 2027", domain `<domain>`.
3. **Copy the website ID** (in the settings of the created website, a value like `496cd939-2b53-4eb6-ac6a-b6d61292f024`).
4. **Enter it in the web config:** add the line `PUBLIC_UMAMI_WEBSITE_ID=<ID>` to `web/.env`.
5. **Deploy again:** `./deploy/deploy.sh`. Now the site contains the tracking script.
6. **Check:** open the site in a private window via `https://<domain>/q/flyer`. The visit must appear in Umami under "Realtime". Click the ticket button: the event `ticket-click` appears. For the analysis "how many clicks per channel", use the **Attribution** report with the event `ticket-click` as conversion (see `CLAUDE.md`).
7. **Remove test data** before the QR codes are distributed: reset the data in the website's settings in Umami.

> Menu names in Umami may differ slightly depending on the version. The flows (log in, change password, create website, website ID) were only tested via the API with Umami 3.4.0, not in the UI.

## Setting up backups

`deploy.sh` warns as long as no backup job runs on the VM. Set it up (once, on the VM as root):

```sh
ssh root@<vm>
/opt/straussi/backup.sh                # test once by hand, creates /opt/straussi/backups/umami-....sql.gz
crontab -e                             # add this line (daily at 03:15):
15 3 * * * /opt/straussi/backup.sh >> /var/log/straussi-backup.log 2>&1
```

(Adjust the path if `DEPLOY_PATH` differs.) The last 14 backups are kept.

**The backups are on the same VM.** Additionally copy them regularly to another computer, e.g. from there:

```sh
rsync -az root@<vm>:/opt/straussi/backups/ ~/straussi-backups/
```

Restoring: see [analytics/README.md](../analytics/README.md#backup-and-restore).

## Everyday use

| What | How |
| --- | --- |
| Changed a text or channel | edit the file in `web/`, commit, `./deploy/deploy.sh` |
| New channel for QR codes | extend `web/src/data/channels.ts`, `./deploy/deploy.sh`, commit the new files in `docs/` |
| Only upload again, without rebuilding | `./deploy/deploy.sh --skip-build` |
| Check the status | `ssh root@<vm> "cd /opt/straussi && docker compose ps"` |
| Update Umami | change the version tag in `analytics/docker-compose.yml`, back up first, then `./deploy/deploy.sh` |
| Go back to an earlier state | check out the Git state (`git checkout <commit>`), `./deploy/deploy.sh` |

## Switching providers

Tested (locally, with a fresh "VM" without prior state):

1. Prepare a new VM with Docker, rsync and SSH access (as above).
2. Fetch the latest backup from the old VM: `rsync -az root@<old>:/opt/straussi/backups/ ./backups-old/`
3. Point `deploy/deploy.env` to the new VM (`DEPLOY_HOST`), run `./deploy/deploy.sh`. New secrets are created on the new VM; that is fine, the data does not depend on them.
4. Restore the backup: copy the `backups/` folder to the new VM and run the restore from [analytics/README.md](../analytics/README.md#backup-and-restore). Afterwards password, website and statistics are back; the **website ID stays the same**, so `web/.env` does not need to change.
5. Switch **DNS** to the new IP (lower the TTL of the records beforehand). The **domain must not change**, otherwise the printed QR codes lead nowhere.
6. From now on set up the backup on the new VM (section above) and shut down the old VM.

## Troubleshooting

On the VM in the folder `/opt/straussi`:

| Symptom | Cause and fix |
| --- | --- |
| Script reports "not reachable" | The certificate still needs time; otherwise look at `docker compose logs caddy`. Usually DNS does not point to the VM yet, or port 80/443 is blocked. |
| `stats.<domain>` shows "502" | Umami is still starting (up to a minute) or has crashed: `docker compose ps`, `docker compose logs umami`. The info site still works. |
| Script aborts with "Docker ... missing" | Install Docker with the Compose plugin or rsync on the VM; check the SSH access. |
| Old content visible after deploy | Clear the browser cache (Ctrl+F5). |
| Database looks empty after a move/reinstall | Backup not restored yet (section Switching providers), or the VM's `.env` was replaced and Umami/Postgres were recreated with a new password. |

## What is on the VM

```
/opt/straussi/
  docker-compose.yml   comes from analytics/ (overwritten on every deploy)
  Caddyfile            same
  backup.sh            same
  .env.example         same
  .env                 ONLY here: domain, email, secrets (mode 600). Never overwritten.
  site/                the built website (replaced on every deploy)
  backups/             database backups (from backup.sh)
```

Your own changes made directly on the VM in the overwritten files are lost on the next deploy. Always make changes in the repo.
