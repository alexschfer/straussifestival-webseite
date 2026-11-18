# Straussi Festival 2027: Website

> [!IMPORTANT]
> **Delete the analytics data by 2027-12-31 at the latest.** The privacy policy says so (`web/src/pages/datenschutz.astro`), and Matomo does not delete anything on its own.
> To delete: in Matomo, delete the website (Administration > Websites > Manage), or remove Matomo together with its database in Plesk. Also delete the database backups in Plesk.
> If the date changes, update both: this notice and the privacy policy.

Information site for the Straussi Festival 2027 (Straußäcker student residences, Stuttgart) with self-hosted web analytics (Matomo). The site links to the external ticket shop and measures which channel visitors come from and how many of them click the ticket button.

In short: build `web/` and upload it to Plesk at Cloud86; instructions including the Matomo setup: [deploy/PLESK.md](deploy/PLESK.md). Project context and all decisions: [CLAUDE.md](CLAUDE.md). Tasks and status: [docs/SPEC.md](docs/SPEC.md).

## Run locally

Requirement: Node.js 22.12 or newer.

```sh
cd web
npm install
cp .env.example .env    # optional; without .env everything runs with placeholders
npm run dev             # http://localhost:4321
```

## Build

```sh
cd web
npm run build           # checks and builds into web/dist/
npm run preview         # view the built site
```

The build also generates:

- `docs/qr/<slug>.svg`: one QR code per printed channel (`utm_medium` `scan`: flyer, poster, sticker, business card, parties, etc.); WhatsApp, Instagram, TikTok and partner sites get none, share the short link from `docs/channels.md` there instead
- `docs/channels.md`: table of all channels with their UTM links (channels that lead to Instagram are marked there)
- `docs/qr/<page>/<slug>.svg`: the same QR codes for every subpage, e.g. `docs/qr/redirect-instagram/` (leads **directly to Instagram**) and `docs/qr/redirect-ticket/` (leads **directly to the ticket shop**). The visit is counted in Matomo first (event `Instagram` or `Ticket`, action `Weiterleitung`)
- `kalender.ics`: calendar file for the „In den Kalender eintragen“ (add to calendar) button

**Channel with target Instagram:** If a channel in `web/src/data/channels.ts` has `target: 'instagram'`, the normal short link `/q/<slug>` already leads to Instagram (counted) instead of the home page (currently `sticker`, `visitenkarte-insta`, `blockparty-str2`, `netthier`, `maschinenbau`). `/q/instagram` never gets this, because that link is in the Instagram bio.

**Before printing**, the real `SITE_URL` must be set in `web/.env`, otherwise the QR codes point to a placeholder domain. The build warns in that case.

## Changing content

- **Page texts:** one file each in `web/src/pages/` (`index.astro` = home page, `infos.astro`, `lineup.astro`, `faq.astro`, `anfahrt.astro`, `bewohner.astro`, `impressum.astro`, `datenschutz.astro`). The text is directly in the file as simple HTML (`<p>`, `<h2>`, `<ul>`). Places marked **TODO** are still open.
- **English version:** every page also exists in `web/src/pages/en/` (same file name). Always make changes in both languages. Texts of the menu, footer, banner etc. are in `web/src/i18n.ts` in both languages.
- **New page or menu item:** create a file in `web/src/pages/` and extend the navigation list at the top of `web/src/layouts/Base.astro`.
- **Ticket link, date, address, calendar entry, Instagram profile, switches:** `web/src/config.ts`
- **Map image on the directions page:** `web/public/anfahrt/karte.webp`, regenerate with `web/tools/make_map.py` (instructions: `web/public/anfahrt/README.md`). The attribution „© OpenStreetMap-Mitwirkende“ (© OpenStreetMap contributors) must stay.
- **Photos in the Instagram section:** put the file into `web/public/insta/` and add it in `web/src/config.ts` (instructions: `web/public/insta/README.md`)
- **Marketing channels:** `web/src/data/channels.ts` (spelling rule for UTM values: lowercase, no umlauts/ß/spaces, hyphens between words; the build checks this)

## Enabling analytics

Set in `web/.env` (see `web/.env.example`):

```
PUBLIC_MATOMO_URL=https://stats.<domain>
PUBLIC_MATOMO_SITE_ID=<ID from Matomo>
```

If either value is missing, Matomo is not included (and then there is no cookie banner either, as long as no Instagram widget is configured), and the site still works.

## Hosting and deployment

- **Current:** web hosting at Cloud86 with Plesk, Matomo on the same web hosting: [deploy/PLESK.md](deploy/PLESK.md)
- Alternative for an own server with Docker (Caddy, Umami, Postgres; currently **not** in use): [analytics/README.md](analytics/README.md), [deploy/README.md](deploy/README.md). Note: the website itself now includes Matomo, no longer Umami.

Build the ZIP for uploading (in the `web/` folder):

```
npm run build && cd dist && rm -f ../../straussifestival-webseite.zip && zip -qr ../../straussifestival-webseite.zip .
```
