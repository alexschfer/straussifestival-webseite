# Hosting at Cloud86 (web hosting with Plesk) and Matomo

This is how the site currently runs: **web hosting "Medium" at Cloud86** with Plesk. There is no Docker there, so:

- The website is **built locally** and uploaded as finished files to `httpdocs`.
- Analytics is **Matomo** (PHP/MySQL) at `stats.straussifestival.de`, on the same web hosting.
- `analytics/` (Docker, Caddy, Umami) and `deploy/deploy.sh` are the alternative for an own server and are **not** used here.

Menu names in Plesk and Matomo may differ slightly depending on the version. The menu paths below are given in English; in the German interface they have the corresponding German names.

## 1. Once: domain and subdomain in Plesk

1. **Websites & Domains:** check that `straussifestival.de` is set up as a website (document root `httpdocs`). Do not touch the Nextcloud at `cloud.straussifestival.de`.
2. **Add subdomain:** `stats.straussifestival.de` (own document root, e.g. `stats.straussifestival.de`).
3. **SSL/TLS certificates:** get a free Let's Encrypt certificate for `straussifestival.de`, `www.straussifestival.de` and `stats.straussifestival.de`. Contact email: `orga@straussifestival.de`.
4. **PHP settings** of the subdomain `stats`: PHP 8.1 or newer.
5. **Logs (mandatory, the privacy policy says so):** for `straussifestival.de` and `stats.straussifestival.de` under *Logs > Log rotation*: by time, **monthly** (daily is blocked at Cloud86), maximum number of log files **1**, do not send by email. This gives a retention of at most about 2 months.

## 2. Once: install Matomo

1. **Databases > Add database:** MySQL/MariaDB, name e.g. `matomo`, with its own user and a strong password (password manager).
2. Download Matomo: <https://matomo.org/download/> (ZIP, current version).
3. In Plesk, open the folder of the `stats` subdomain in the **File Manager**, upload the ZIP and extract it there. Matomo then sits in a subfolder `matomo/`: move its **contents** one level up so that `index.php` is directly in the subdomain's folder.
4. Open `https://stats.straussifestival.de` and click through the installation wizard:
   - Database: server `localhost`, name, user, password from step 1.
   - Create a super user (login for the analytics, password into the password manager).
   - First website: name `Straussi Festival`, URL `https://straussifestival.de`, time zone `Europe/Berlin`.
   - Do **not** add the displayed tracking code; the site does that itself.
5. Enter the **website ID** (usually `1`) in `web/.env` as `PUBLIC_MATOMO_SITE_ID`.

## 3. Once: configure Matomo

- **Administration > Privacy > Anonymize data:** mask IP addresses by **2 bytes**, also for geolocation ("Also use the anonymized IP addresses when enriching visits"). The privacy policy says so.
- **Administration > Marketplace:** install and activate the plugin **"Marketing Campaigns Reporting"** (free). Only then does Matomo show `utm_source`, `utm_medium` and `utm_content` separately (flyer/poster/sticker, scan/messenger/social).
- **Goals > Manage goals > Add goal:** name `Ticketklick`, triggered by **Event**, category is exactly `Ticket`. Matomo then shows how many ticket clicks each channel brings.
- Optional: **Administration > System > General settings > Archiving:** with little traffic, the default is enough (reports are computed when viewed).

## 4. Upload the website (on every change)

```sh
cd web
npm ci
npm run build                       # checks and builds into web/dist/
cd dist && rm -f ../../straussifestival-webseite.zip && zip -qr ../../straussifestival-webseite.zip . && cd ../..
```

Then in Plesk open `httpdocs` in the **File Manager**, upload `straussifestival-webseite.zip`, **extract it (overwrite existing files)** and delete the ZIP again. The file `.htaccess` is part of it (HTTPS, www redirect, 404 page, channel redirects).

Afterwards commit `docs/` if QR codes or `docs/channels.md` have changed.

> Old files stay in place when extracting. If a page is deleted or renamed, delete its folder in `httpdocs` by hand.

## 5. Check after the first upload

- Open `https://straussifestival.de`, `https://straussifestival.de/q/flyer` and `https://straussifestival.de/redirect-instagram/q/flyer`.
- In Matomo, the visit must appear under **Visitors > Real-time**, and under **Acquisition > Campaigns** with source `flyer`.
- Scan every QR code with an iPhone and an Android phone.
- Then delete the test visits (e.g. under *Administration > Privacy > GDPR tools*, or delete the website data) before the QR codes are distributed.

## Ongoing

- **Install Matomo updates** as soon as Matomo shows one at the top (button in the admin area). Back up the database in Plesk first.
- **Delete the analytics by 2027-12-31** (see the notice at the top of the README).
