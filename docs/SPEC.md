# Tasks and status

Context, decisions and rules are in `CLAUDE.md`.

## Phases

### Phase 1: `web/` (done)

- [x] Astro static, TypeScript, no UI framework
- [x] Pages as plain Astro pages (`web/src/pages/*.astro`, shared layout, navigation as a list in the layout; originally Markdown/content collections, later switched on request): home page, info, FAQ, directions, imprint, privacy policy
- [x] Mobile, simple layout (dark theme), prominent ticket button, central ticket URL in `web/src/config.ts`
- [x] Instagram section on the home page (links and tiles; optionally a real feed via widget with cookie banner)
- [x] Redirect `/redirect-instagram/` with counting in Umami, for QR codes leading directly to Instagram (`/redirect-instagram/q/<slug>`, QR codes in `docs/qr/redirect-instagram/`)
- [x] Central channel file `web/src/data/channels.ts` with validation of the UTM spelling rule
- [x] Generated from the channels: redirects `/q/<slug>`, QR codes (`docs/qr/`), `docs/channels.md`
- [x] Umami integration via environment variables (no values, no script)
- [x] Ticket button triggers the Umami event `ticket-click`
- [x] Optional script "append UTMs to the ticket link", via a switch, default OFF
- [x] `CLAUDE.md`, `README.md`, `docs/SPEC.md`

### Phase 2: `analytics/` (done, tested locally with Docker)

- [x] `docker-compose.yml` (Umami with Postgres image, Postgres in a named volume)
- [x] `Caddyfile`: main domain serves the Astro files, `stats.<domain>` goes to Umami, automatic HTTPS
- [x] `.env.example` with explanations
- [x] `backup.sh`: nightly `pg_dump`, compressed, 14 versions, cron example
- [x] Instructions: test locally with Docker (`analytics/README.md`)
- [x] `web/src/pages/404.astro` (Caddy needs `404.html`)
- [ ] First test with the **real Umami tracker** in the browser (so far only simulated requests) and on the real VM with real HTTPS

### Phase 3: `deploy/` (done, tested against a simulated VM)

- [x] Deployment instructions (`deploy/README.md`) and deploy script (`deploy/deploy.sh`: build locally, `rsync`, start containers)
- [x] Steps after the first start: change the Umami admin password, create the website, enter the website ID in the web config
- [x] Host-independent (only `DEPLOY_HOST` changes; provider switch including backup restore tested locally, no Terraform)
- [ ] First real deploy to the Selfnet VM (waiting for VM, domain, DNS)
- [ ] Go through the Umami UI once in the browser (menu names, changing the password, finding the website ID, resetting data) and adjust `deploy/README.md` if anything differs; so far only the API flows were tested
- [ ] Set up the backup cron on the VM and organise an off-site copy of the backups

### Switch to Cloud86 web hosting and Matomo

- [x] Tracking switched to Matomo (without cookies, with cookies after consent), cookie banner always active with Matomo
- [x] Privacy policy switched to Cloud86 and Matomo, `.htaccess`, instructions `deploy/PLESK.md`
- [x] In Plesk: subdomain `stats`, SSL, database, Matomo installed
- [x] In Matomo: IP anonymisation 2 bytes, plugin Marketing Campaigns Reporting, goal „Ticketklick“, site ID 1
- [x] Log rotation for `straussifestival.de`: monthly, 1 file (privacy: at most 2 months)
- [ ] Also check log rotation for `stats.straussifestival.de`
- [ ] First upload, test with real phones, delete test data
- [ ] Switch the **bio links** to the short URLs: Instagram `straussifestival.de/q/instagram`, TikTok `straussifestival.de/q/tiktok` (the Instagram bio currently does not contain the short URL, `ig` showed up in Matomo)
- [x] Catch-all rule `ig` -> `instagram` (`foreignSources` in `web/src/data/channels.ts`)
- [ ] Download the DPA from Cloud86 and file it with the association; check whether the Cloud86 account is registered to Straussi 1 e.V.

## Open items (TODO, do not invent)

- [ ] **Festival times:** the calendar entry is all-day (`calendar` in `web/src/config.ts`), the countdown counts to midnight. Adjust both once real times are known.
- [ ] Test the map and the calendar button on real phones (Apple Maps/Calendar on iPhone, Google Maps/Calendar on Android)

- [ ] **Reply from Selfnet:** VM, domain, DNS
- [ ] Enter the **real ticket shop URL** (`ticket.url` in `web/src/config.ts`)
- [ ] **Does the ticket shop evaluate UTM parameters?** (Request pending.) Only then set the switch `ticket.forwardUtm` in `web/src/config.ts` to `true`.
- [x] **Imprint**: organiser is Straussi 1 e.V.; details taken from its imprint (https://straussi1.de/wohnheim/rechtliches/impressum, as of 2026-10-20)
- [ ] Possibly change the copyright line in the footer to Straussi 1 e.V. (`web/src/layouts/Base.astro`)
- [x] **Contact address** `info@straussifestival.de` (`festival.email` in `web/src/config.ts`, footer and imprint)
- [ ] The mailbox `info@straussifestival.de` must really exist and be read (email hosting/MX for the domain)
- [x] **Channel list** decided: `flyer`, `plakat`, `sticker` (medium `scan`), `whatsapp` (`messenger`), `instagram`, `tiktok` (`social`); plus one QR channel per residence party: `kattafest-str1`, `winterfest-str3`, `halloween-str1` (one QR code each, medium `scan`)
- [ ] **Festival content** (date, line-up, prices, directions, FAQ answers; everything marked `TODO` in `web/src/pages/` and `web/src/config.ts`)
- [ ] **Set `SITE_URL`** as soon as the domain is decided, and rebuild the QR codes. Only then print.
- [ ] Put **own photos** for the Instagram tiles in place (`web/public/insta/`, currently placeholders "TODO Foto"). The profile `@straussifestival` is set.
- [x] Privacy policy filled in (Straussi 1 e.V. as controller, actual technical setup)
- [ ] Privacy: clarify the **server location** (own hardware or rented server? If rented, name the provider), **delete analytics by 2027-12-31** (stated in the privacy policy and at the top of README.md)
- [ ] Have the privacy policy and imprint legally reviewed
- [ ] Create the **Instagram widget at LightWidget** (provider decided, free) and enter it in `instagram.widget` in `web/src/config.ts` (instructions: `web/public/insta/README.md`); then complete the `#instagram-feed` section of the privacy policy and have it reviewed

## To check (risks noticed during the build)

- [ ] **Channel attribution across several pages.** Umami reads UTM parameters from the URL of each request; a click on a subpage (e.g. `/infos/`) carries no UTMs itself. Tested with Umami 3.4.0 and simulated requests: the **Attribution** report (conversion = event `ticket-click`) still assigns the click to the entry channel. A filter directly on the event by UTM would miss it. So use the attribution report for analysis and double-check with the real tracker after the first start. Only if that is not enough: pass the UTM parameters on to internal links with a small script (no cookie, no localStorage).
- [ ] **Redirects are meta-refresh pages**, not HTTP 301 (a property of Astro in static mode). Caddy serves `/q/<slug>` directly, without an extra detour. Real 301s would only be possible with Caddy rules, but are not needed.
- [ ] **QR codes in `docs/qr/` only point to the real address once `SITE_URL` is set.** `docs/channels.md` warns as long as the placeholder domain applies.
- [ ] **Privacy policy:** Caddy writes no access logs (the policy says so). Clarify whether the server provider or the network keeps its own logs (see the TODO comment in `web/src/pages/datenschutz.astro`).
