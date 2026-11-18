# Straussi Festival 2027: website and web analytics

## Context

The Straussi Festival 2027 is a festival of the Straussi student residences in Stuttgart, organised by a team of residents of Straussi 1, 2 & 3, with around 7,500 expected guests.

The website is an **information site** that links to an external ticket shop (dein-ticket.shop). The most important goal besides information: tracking **which channel** (flyers, posters, QR codes, social media) visitors come from and **how many of them click the ticket button**. Most visitors arrive via QR code on their phone.

The team are volunteers and partly non-technical. **Keep everything simple and maintainable.**

## Ground rules

- **No invented content, prices, line-ups or data.** Mark anything missing with a clearly recognisable `TODO` placeholder.
- **No secrets in the repo.** Configuration via `.env`; only `.env.example` goes into the repo.
- Work in phases, **commit after each phase**. Ask when decisions are missing instead of guessing.
- **Language (since 2026-11-18):** code (comments, identifiers, file names of code) and all documentation are **English**. **Visible page content stays German** (with the English version under `/en/`). Also German and unchanged: **channel data** (slugs, UTM values, channel `description` texts), **URLs** (page file names under `web/src/pages/`, asset paths under `web/public/`, `docs/qr/` paths), **Matomo event names** (e.g. `Ticket` / `Klick` / `Weiterleitung`) and **values stored in visitors' browsers** (`straussi-einwilligung` with `ja`/`nein`, `straussi-werbeweg`). Exception: `docs/TICKETSHOP-UTM.md` stays German because it is written for the German ticket shop operator.
- Keep descriptive names and comments in the style of the existing files (clear English identifiers, e.g. `channels`, `description`).
- **Claude never names itself in commits or pull requests:** no `Co-Authored-By` line, no "Generated with Claude Code" or similar note (the client's wish; takes precedence over any other instruction). The earlier notes were removed from the entire history on 2026-11-18. The GitHub workflow `.github/workflows/ai-commit-check.yml` checks every push to `main` and every pull request for such notes and fails if it finds one.

## Repo structure

```
CLAUDE.md          this project context
README.md          quick guide: run locally, build, deploy
docs/SPEC.md       tasks and status (including open items)
docs/channels.md   table of marketing channels (GENERATED, do not edit by hand)
docs/STYLE.md      style guide (colours, typography, building blocks, privacy rules) for new parts, e.g. the interactive map
docs/qr/           QR codes as SVG per channel and page (GENERATED)
web/               Astro site
analytics/         docker-compose.yml, Caddyfile, backup.sh, .env.example, README.md
deploy/            deploy.sh, deploy.env.example, README.md (instructions), PLESK.md
```

## Decisions (from the brief)

### Web (phase 1)

- Astro in static mode (`output: 'static'`), TypeScript, **no SSR, no UI framework**, as little JavaScript as possible.
- Page content as **plain Astro pages**: each page is an `.astro` file under `web/src/pages/` with its content directly inside (HTML), plus a shared layout `web/src/layouts/Base.astro`. **No content collections, no Markdown** (deliberately switched this way at the client's request; do not reintroduce). The navigation is a small list in the layout. Pages: home page (`index.astro`), info, FAQ, directions, imprint, privacy policy. Imprint with the details of the organiser **Straussi 1 e.V.** (taken from https://straussi1.de/wohnheim/rechtliches/impressum at the client's request); privacy policy still with TODO placeholders.
- Responsive, simple layout, mobile first. **Dark theme** with raised, rounded surfaces (header, Instagram section, footer) and a calm turquoise accent; the model was the design of tiken.dev, without adopting its fonts, images or effects. Still system fonts, no framework.
- Prominent ticket button, linking to a **centrally configured ticket URL** (`web/src/config.ts`, currently a placeholder).

### Channels and tracking (core)

- **A single data source** for all marketing channels: `web/src/data/channels.ts`. Per channel: slug, `utm_source`, `utm_medium`, `utm_content` (optional), description.
- Generated automatically from it at build time:
  1. Redirects `<page>/q/<slug>` -> `<page>?utm_...` (`redirects` option in `astro.config.ts`). **`/q/<slug>` works behind every page**, i.e. `/q/mensa` (home page), `/lineup/q/mensa`, `/infos/q/mensa` etc. The page list is read automatically from `src/pages/` by `web/integrations/pages.ts`; a new page therefore gets its redirects on its own. A channel needs no entry for this; the UTM parameters are the same for every target page.
  2. One QR code as SVG per **printed channel (`utm_medium` `scan`)** and page (npm package `qrcode`, error correction Q, approx. 25 %; WhatsApp, Instagram, TikTok get no QR code, their links are shared directly): `docs/qr/<slug>.svg` for the home page, `docs/qr/<page>/<slug>.svg` for the other pages.
  3. `docs/channels.md`: table with slug, finished UTM link and QR file.
  (2 and 3 are done by the integration `web/integrations/channels-output.ts` in the hook `astro:build:done`.)
- `utm_campaign` is always `straussi-festival-2027`.
- **Spelling rule for UTM values** (and slugs): lowercase letters (and digits) only, no umlauts, no ß, no spaces, words joined by hyphens. **Enforced at build time by validation** (`validateChannels` in `channels.ts`; the build aborts on violations). Duplicate slugs also abort the build.
- **Channels (decided by the team):** one channel per type, **not per location** (individually printed QR codes are not worth the money): `flyer`, `plakat`, `sticker`, `whatsapp`, `instagram`, `tiktok`. Mandatory for the analysis is distinguishing **scan vs. messenger**; that lives in `utm_medium`.
- **Exception parties:** exactly one channel per party. **Link (slug) short, just the party** (`/q/kattafest`, `/q/winterfest`, `/q/halloween`, `/q/maschinenbau`), **source (`utm_source`) with the residence abbreviation** (`kattafest-str1`, `winterfest-str3`, `halloween-str1`; `maschinenbau` without, because it is not a residence party). That keeps the numbers in Matomo/the shop continuous, and you can see the residence. Until 2026-11-04 the links were also called `…-str1`/`…-str3`; the already printed code `halloween-str1` is listed as `oldSlugs` in the channel and redirects with 302 (on every page). **Never simply rename printed slugs**; add them to `oldSlugs` instead. The party is in `utm_source`, the medium is always `scan`: at the party there are only QR codes, and everything printed there (stands, flyers, screen) uses the same code. No `utm_content`, no sub-channels per route and no WhatsApp link per party (deliberately decided so; only the number per party is wanted). General festival flyers handed out there still count as `flyer`. New party = one entry in `channels.ts` following the same pattern (slug = party name, source = `<party>-str<nr>`).

### Analytics integration

- **Umami, self-hosted.** The script is included via the central config: host and website ID as environment variables `PUBLIC_UMAMI_HOST` and `PUBLIC_UMAMI_WEBSITE_ID` (currently placeholders). **If the values are missing, the script is not included** and the site still works.
- The ticket button triggers an **Umami click event** (`ticket-click`), via a `data-umami-event` attribute without custom JavaScript. The position (`header`/`hero`/`footer`) is sent as `data-umami-event-position`.
- An **optional script appends the UTM parameters** of the current visit to the ticket link. Switch `ticket.forwardUtm` in `web/src/config.ts`, **OFF by default** (still unclear whether the ticket shop evaluates UTMs). When OFF, the script is not shipped.
- **No cookies, no localStorage, no Google Analytics.** The site gets by without a cookie banner. Therefore also: no embedded maps, videos, fonts or widgets from third parties without clarifying privacy first. **The only intended exception:** the Instagram feed (see "Instagram feed with cookie banner"), and only if it is entered in the config.

### Analytics server (phase 2, implemented)

- `docker-compose.yml` with Umami (Umami's official Postgres image) and Postgres in a named volume.
- Caddy as reverse proxy with automatic HTTPS: the main domain serves the static files of the Astro site, `stats.<domain>` forwards to Umami.
- All secrets via `.env`, plus `.env.example` with explanations.
- `backup.sh`: nightly `pg_dump`, compressed, last 14 versions kept, plus a cron example.
- Short instructions for testing locally with Docker.

### Deployment (phase 3, implemented)

- Target system: a single Linux VM from Selfnet e.V. (not yet available, being requested). Root access and Docker assumed.
- Procedure: build Astro **locally**, copy the output folder to the VM with `rsync`, start the containers. **Node does not run on the server.**
- **No Terraform.** Everything host-independent, so that a switch to another provider (e.g. Hetzner) is possible without rework.
- Document the steps after the first start: change the Umami admin password immediately, create the website, enter the website ID in the web config.

## Decisions from phase 1 (not set in the brief, can be changed at any time)

- **Domain** comes from the environment variable `SITE_URL` (`web/.env`). Without it, the placeholder domain `https://todo-domain.invalid` applies; the build then warns, and `docs/channels.md` carries a warning. Only print QR codes once `SITE_URL` is really set and the site has been rebuilt.
- **QR codes live in `docs/qr/`** and are committed, so the team can get them from the repo without a Node setup and the links in `docs/channels.md` work.
- `utm_content` is **optional** (only set where a channel has variants).
- **Digits** are also allowed in UTM values (a-z, 0-9, hyphen).
- `utm_medium`: `scan` (printed QR codes: flyer, poster, sticker), `messenger` (WhatsApp), `social` (Instagram/TikTok bio), `plattform` (links on third-party event pages/partners: `rausgegangen`, `studentenpartys-stuttgart`; for links that are entered rather than printed, write the slug out in full). Formerly `print`, renamed because the team thinks in terms of "scan". Slugs deliberately short (`flyer` instead of `scan-flyer`) so the QR code is less dense.
- The ticket button opens the shop in a **new tab** (`target="_blank"`) so the info site stays open.
- In Astro static mode, redirects are **meta-refresh pages** (`<page>/q/<slug>/index.html`), not real HTTP 301s. Sufficient for QR codes; the UTM parameters are preserved.
- **TypeScript is pinned to 6.x** because `astro check` does not yet work with TypeScript 7. Only raise it once Astro supports it.

## Decisions from phase 2 (not set in the brief, can be changed at any time)

- **Umami version pinned** to `ghcr.io/umami-software/umami:3.4.0`. Checked: `3.4.0`, `latest` and `postgresql-latest` are the same state (Umami 3 only supports Postgres). Updating = change the tag, back up first.
- Database: `postgres:17-alpine`. Umami runs with `DISABLE_TELEMETRY=1`.
- **Caddy does not depend on Umami** (no `depends_on`): the info site stays reachable even if Umami fails. Tested.
- Domain, email for Let's Encrypt, all secrets and an optional path to the website (`SITE_DIR`, default `./site`) come from `analytics/.env`. Missing required values make `docker compose` abort with an error message.
- `HTTP_PORT`/`HTTPS_PORT` can only be overridden for the local test (template `analytics/.env.local.example`, domain `localhost`, ports 8080/8443). On the server they stay 80/443.
- Caddy serves `/q/<slug>` and `<page>/q/<slug>` directly (`try_files {path} {path}/index.html`, works for paths of any depth), i.e. without an additional redirect to the trailing slash. Unknown addresses show `404.html` (page `web/src/pages/404.astro`).
- **Caddy writes no access logs** (default behaviour, deliberately left that way; relevant for the privacy policy). Container logs are limited to 3 x 10 MB.
- `backup.sh` runs on the host via `docker compose exec`, first writes to a `.partial` file, checks it and then renames it. Backups are stored in `analytics/backups/` by default (not in Git). An off-site copy is the team's job (mentioned in the instructions).
- **Attribution (tested with Umami 3.4.0, simulated requests):** if a visitor enters via `?utm_source=aushang` and then clicks the ticket button on a subpage without UTMs, Umami's **Attribution** report (conversion = event `ticket-click`) still assigns the click to the channel. A direct filter on the event by UTM would miss it. So use the attribution report for the analysis.

## Decisions from phase 3 (not set in the brief, can be changed at any time)

- **One script for everything:** `deploy/deploy.sh` checks, builds (`npm ci`, `npm run build`), copies via rsync and starts the stack via SSH. Repeatable. Option `--skip-build`. Settings in `deploy/deploy.env` (not in Git, template `deploy.env.example`), the site's addresses in `web/.env`.
- **Flat server layout:** the files from `analytics/` sit directly in `DEPLOY_PATH` (default `/opt/straussi`), the site in `DEPLOY_PATH/site/`, backups in `DEPLOY_PATH/backups/`.
- **The script creates the `.env` on the VM itself on the first deploy** (from `analytics/.env.example`, `DOMAIN` from `SITE_URL`, three freshly generated secrets, mode 600). It is never overwritten later. The secrets only exist on the VM (a copy in the password manager is recommended); the database backups do not depend on them.
- **Protection against bad deploys:** abort if `SITE_URL` is missing or a placeholder (`*.invalid`, `*.example.org`). Only a warning (no abort) for a missing Umami ID (normal on the first deploy, it only exists after Umami has started), a deviating Umami host and a placeholder ticket URL.
- **rsync details that must not be "simplified":** config files with `--inplace` (the Caddyfile is mounted as a single file; an rsync rename would leave it stale in the container). Then `caddy reload`. The site with `--delete --delay-updates` into the existing folder `site/` (the folder itself must not be replaced, it is mounted into Caddy).
- **Fixed Compose project name** (`name: straussi`), so that volume names do not depend on the folder name. Do not change it, otherwise the database appears empty.
- **The script does not set up the cron job for the backup itself**; it only warns as long as none exists (cron line in `deploy/README.md`).
- The reachability check at the end is not fatal (DNS and certificate need time the first time).
- Every build with a real domain regenerates `docs/channels.md` and `docs/qr/`; these changes must be committed.
- **The domain must not change when switching providers** (printed QR codes). The switch was tested locally: fresh VM, new deploy, restore backup; password, website and website ID come back.

## Decisions from the design round (can be changed at any time)

- **Dark theme.** Colours are variables at the top of `web/src/styles/global.css` (`--color-background`, `--color-accent` etc.). A different accent colour is a single line. There is no light theme; the page declares itself dark via `color-scheme: dark`.
- **No external fonts, images or effects.** The model was only the look and feel (dark background, rounded surfaces, one accent colour). Still system fonts, so nothing is loaded from third-party servers (privacy, load time).
- **Instagram/TikTok section on the home page** („Bleib auf dem Laufenden“, "stay in the loop", modelled on Ricola): heading, one sentence, one link button each to Instagram and TikTok, tiles below. Swipeable on mobile, side by side from tablet width. Real profiles: `@straussifestival` on both platforms (`instagram` and `tiktok` in `web/src/config.ts`).
- ~~Nothing from Instagram or TikTok is embedded.~~ **Superseded** at the client's request, see "Instagram feed with cookie banner". The tile photos (own files from `web/public/insta/`) remain as a display without consent.
- As long as `instagram.profileUrl` in `web/src/config.ts` still contains `TODO`, the build and `deploy.sh` warn (currently resolved, the real profile is entered). Without entered photos the tiles are **not shown at all** (the client's wish: no placeholders live); what remains is the yellow colour panel with heading and the buttons to Instagram and TikTok. From the first photo on, the grid appears again (with placeholders if there are fewer than 5 photos).
- **Footer modelled on Ricola:** a rounded panel with four columns (Follow us with Instagram and TikTok buttons, Festival with the menu links, Tickets with button, Contact) and a narrow bar below it: on the left the festival name and organiser, on the right imprint, privacy policy and "© Straussi Festival 2027". On mobile the columns stack. Menu links and legal links come from the lists in the layout (`mainMenu`, `footerMenu`).
- **The ticket button now appears three times** (header, home page hero, footer). The click event `ticket-click` is the same; the location is sent as `position` (`header`, `hero`, `footer`) in the event and can be distinguished in Umami.
- **The copyright line deliberately names no rights holder and no year.** Straussi 1 e.V. is now in the imprint; whether the line should name the association has not been decided yet.
- `festival.name` in `config.ts` is composed of `shortName` and `year`, so the year can be coloured differently in the header and only exists in one place.
- The privacy page has an additional section on the links to Instagram and TikTok (with a TODO for the legal review).

## Decisions from the scroll redesign (can be changed at any time)

- **Smooth scrolling with gentle fade-in animations**, no scroll snapping (model: Fusion Festival archive pages). Sections get the class `.fade-in`; an `IntersectionObserver` in `web/src/components/HomePage.astro` adds `.visible` once while scrolling. **Content is only hidden when the script runs** (it sets `.fade-in-active` on `<html>` itself); otherwise everything between header and footer stayed empty on some phones. Do not switch back to pure CSS hiding. The hidden initial state in `global.css` is deliberately only inside `@media (prefers-reduced-motion: no-preference)` – anyone who has reduced motion enabled sees all content immediately.
- **Hero screen with photo collage:** three own party photos from the summer parties of Straussi 1 and 2 as background (formerly photos of the courtyards that did not look like a party; **no sponsors in the photos**, cropped to portrait 1000 x 1500) (`web/public/wohnheime/`, instructions in the README there), plus a dark gradient overlay for text readability. Images shrunk/compressed with Pillow before committing (portrait max. 1000 x 1500 px, JPEG quality ~70) – according to the brief, most guests arrive on mobile via QR code.
- **Light parallax effect** on the three photos when scrolling, deliberately via a little vanilla JS (`scroll` listener, throttled with `requestAnimationFrame`) instead of `background-attachment: fixed` or CSS scroll timelines: fixed backgrounds are unreliable on iOS Safari, scroll timelines are not supported there yet. With `prefers-reduced-motion: reduce` the photos stay still.
- **Countdown to the festival start** (`web/src/components/Countdown.astro`) below the hero screen. The target time is `festival.startTime` in `config.ts`, currently `2027-06-11T00:00:00+02:00` – midnight as a deliberate placeholder that can be changed at any time, as long as no more precise start time is known. The initial HTML state shows placeholder dashes instead of a number computed at build time (otherwise a wrong number could flash briefly if the site is rarely rebuilt); after the start, a text appears instead of negative numbers.
- **New, final logo** (ostrich at the DJ desk, round, transparent; source `Logo_v01_full_transparent_Straussifestival.png`, cropped to the content and made square). Two files: `web/public/logo.webp` (640 px, large in the hero screen; WebP because PNG would be 600 KB with the colour gradient, or show banding as a palette PNG) and `web/public/logo-klein.png` (128 px, palette PNG, about 7 KB: header, footer, favicon, Instagram redirect). No more rounded corners via CSS, the logo is round itself. To replace: swap both files.
- **Header and footer deliberately without an inset panel look:** unlike before, `.site-header` and `.site-footer` take up the full screen width and touch the top and bottom edge respectively (background colour and divider are on the outer element, only the content stays centred via `--width-large`). The Instagram section stays a separate colour panel (see its own item further below); the countdown box, on the other hand, has since been removed (also its own item).
- **The box behind the countdown was removed.** `.countdown-panel` no longer has a border/background/rounding; heading and number tiles stand directly on the page background like the rest of the page content.
- **Countdown tiles in the look of the Fusion Festival archive page** (two-tone tile: large number on top on an accent surface, label below on a dark surface in capitals), but with our colours (`--color-accent`/`--color-accent-dark`) and the system font instead of the model's font/imagery.
- **The floating Astro dev toolbar is switched off** (`devToolbar: { enabled: false }` in `astro.config.ts`): only confusing for a non-technical team, of no use to visitors.
- **The line-up has its own page** (`web/src/pages/lineup.astro`, menu item between info and FAQ). The "Programm und Line-up" section on the home page only links there briefly, instead of maintaining the TODO notes twice.
- **Pink (accent B, `--color-accent-two`) is the highlight colour**, gold (accent A) remains the action colour for buttons and the focus ring – deliberately separate roles. Pink now colours links (`a`), emphasised text (`.prose strong`) and hover/active states in the menu and the footer. On the lighter surface panels (header/footer, tiles) it stays gold, because pink there would have too little contrast according to the contrast calculation (WCAG formula) – see the comments in `global.css` at the variables.
- **Bug fixed: the ticket button in the footer was unreadable on hover** (text and background exactly the same gold). The cause was a CSS specificity collision: `.footer-column a:hover` was more specific than `.footer-column .button` and overrode its text colour. Fixed with a dedicated, even more specific rule `.footer-column .button:hover`. In addition, the hover effect of all buttons now uses shadow/lift instead of `filter: brightness()` – colours no longer change on hover at all, so the contrast problem cannot come back.
- **Instagram section now exactly modelled on ricola.com/de-de** (section "Stay in the Loop", rebuilt with Playwright and CSS inspection of the live site), but with our action colour (gold) instead of Ricola yellow, our system fonts instead of the Ricola font and our own text that suits us. No longer the previous scroll carousel with arrow buttons – that was an interim solution before the Ricola model was concretely available.
  - A full-width, rounded colour panel (`.insta-panel`, gold) contains only heading, text and two icon-only buttons (Instagram, TikTok; the profile name is in the `aria-label`, only the icon is visible).
  - The photo tiles (`.insta-tiles`) deliberately sit **outside** `.insta-panel` as their own grid (3 columns on mobile, 5 from tablet width) with a zigzag offset (even/odd tile higher/lower) and are pulled over the bottom edge of the colour panel with a negative top margin – so the tall tiles visibly stick out below it. If the grid were inside `.insta-panel`, the negative margin would pull into the heading instead (exactly that happened on the first attempt and was corrected).
  - `.insta-panel` is also narrower than `.insta-tiles` (a fixed amount subtracted from the width, larger from tablet width), so that the outermost left and right tiles also stick out over the sides of the colour panel – again following the Ricola model, which shows the same overhang left and right as at the bottom.
  - On mobile/tablet a rule hides the first and last tile, so that with five tiles exactly one full row of three remains instead of a cut-off second row (the same technique as at Ricola).
  - **Light "trailing" animation:** a little vanilla JS in `InstaSection.astro` sets the CSS variable `--insta-progress` while scrolling (0 to 1, how far the section has scrolled through the viewport); even and odd tiles read it with different factors (`-6%`/`-12%`), so they move at different speeds. Only inside `prefers-reduced-motion: no-preference` – otherwise the tiles stay still.

## Festival colour palette (can be changed at any time)

- The site uses the **palette supplied by the team** (8 shades each of pink, grey, yellow; 4 brightness levels each with one vivid and one muted variant). The theme stays **dark**.
- Roles as before: **yellow `#F3E007` = action colour** (buttons, countdown, Instagram colour panel, focus ring; text on it `#2A2700`), **pink `#EE0CE3` = highlight** (links, emphasised text). On the header and footer surfaces the vivid pink is not enough (3.8:1); there, hover/active use the lighter shade `#F97BF3` (`--color-accent-two-light`). Grey: `#ABABAF` muted text, `#676A79` tiles/icon buttons.
- The palette has **no dark shade**. Background `#1B1C20`, surfaces `#2C2D33` and line `#41434B` are our own slightly bluish shades matching the palette grey. Older sections that speak of "gold" or the turquoise accent now mean yellow.
- The new logo uses yellow and pink to match the palette.

## Instagram feed with cookie banner (can be changed at any time)

- **At the client's request, a real Instagram feed** in place of the tiles, via a **free widget from a third-party provider** in an iframe. **Decided: LightWidget** (according to the provider, no view limit; SnapWidget would be the alternative); Elfsight unsuitable (free plan only 200 views/month). Settings in `instagram.widget` in `web/src/config.ts` (`url`, `provider`, `height`), provider-neutral.
- **Without an entered `url`, nothing changes:** no banner, no localStorage, privacy page with the old text. The banner, the footer link „Cookie-Einstellungen“ (cookie settings) and the privacy sections appear automatically as soon as `url` is set.
- **Own, simple banner** (`web/src/components/CookieBanner.astro`), no external consent tool. „Ablehnen“ (decline) is the same size as „Akzeptieren“ (accept). The iframe is only created by script after „Akzeptieren“ (`InstaSection.astro`); before that and without JavaScript, the tiles with a notice and button remain. Revoking removes the iframe again.
- The answer is stored in **localStorage** (`straussi-einwilligung-instagram`, logic in `web/src/scripts/consent.ts`), not in a cookie. Umami stays cookieless and needs no consent.
- With the widget, the privacy page gets a section `#instagram-feed` (with TODO for provider details, transfer to the USA and legal review).

## Instagram redirect via QR code (can be changed at any time)

- **Page `web/src/pages/redirect-instagram.astro`** counts the visit in Umami and then redirects to `instagram.profileUrl`. Because it is a normal page, `/redirect-instagram/q/<slug>` automatically works for every channel, and the QR codes are generated in `docs/qr/redirect-instagram/<slug>.svg`. No channel of its own, no config of its own.
- Flow: `/redirect-instagram/q/flyer` -> (meta refresh) `/redirect-instagram/?utm_...` -> Umami page view with UTMs -> `location.replace` to Instagram. The Umami script runs there with `data-auto-track="false"`; the page sends the page view and the event `insta-weiterleitung` itself and only redirects afterwards (at most 1.5 s wait, immediately without Umami/with a blocker, without JavaScript via meta refresh after 3 s, then uncounted). (Since the switch to Matomo, the event is category `Instagram`, action `Weiterleitung`, configured as `analytics.instaCategory`/`analytics.instaAction` in `config.ts`; see below.)
- Analysis in Umami: event `insta-weiterleitung` (wanted: clearly separated from the website visits) or page `/redirect-instagram/`, broken down by UTM source. The Instagram scans still count as visitors of the site; for pure website numbers, filter out `/redirect-instagram/`. At the bottom there is a button „Zu Instagram“ (to Instagram) in case the automatic redirect does not work (iOS often only opens the Instagram app on a tapped link; still to be tested on real phones). Deliberately without the shared layout (no header/footer, no banner) and with `noindex`. Not in the menu.

## Switch to Cloud86 web hosting and Matomo (takes precedence over all older sections on Umami, Docker and deploy)

- **Hosting:** web hosting "Medium" at **Cloud86 B.V.** (Plesk, LiteSpeed/Apache, PHP/MySQL, data centres in NL). The Nextcloud at `cloud.straussifestival.de` also runs there (do not touch). **No Docker, no root** – hence no Umami. The site is built locally and uploaded via the Plesk file manager (ZIP) to `httpdocs`. Instructions: `deploy/PLESK.md`. According to Cloud86's privacy policy, the DPA applies automatically with use (file the DPA PDF).
- **Analytics: Matomo** (self-installed at `stats.straussifestival.de`, same web hosting) instead of Umami. Environment variables `PUBLIC_MATOMO_URL`, `PUBLIC_MATOMO_SITE_ID`. Integration in `web/src/components/Analytics.astro`.
- **Cookies: hybrid.** By default Matomo counts **without cookies** (`requireCookieConsent`); after „Akzeptieren“ in the cookie banner `setCookieConsentGiven` (recognition across days, cookies `_pk_id`/`_pk_ses`), on „Ablehnen“/revocation `forgetCookieConsentGiven`. That is why the **cookie banner now always appears** as soon as Matomo is active (`bannerActive` in `config.ts`). One answer applies to analytics cookies and the Instagram feed. localStorage key `straussi-einwilligung`.
- **Events:** ticket click = category `Ticket`, action `Klick`, name = `header`/`hero`/`footer` (click listener in `Analytics.astro` on `[data-ticket-link]`, `data-position`). Instagram redirect = category `Instagram`, action `Weiterleitung` (with callback, then `location.replace`). `enableLinkTracking` additionally counts outgoing links (Instagram, TikTok, ticket shop).
- **Channels in Matomo:** UTM parameters are read; to see `utm_source`/`utm_medium`/`utm_content` individually, the free plugin **Marketing Campaigns Reporting** is needed. Ticket clicks per channel via the goal **Ticketklick** (event, category `Ticket`). Without cookie consent, Matomo only attributes clicks to a channel within the same visit.
- **Privacy policy** accordingly: Cloud86 as host with DPA, **server log files at most 2 months** (log rotation in Plesk monthly – daily is blocked at Cloud86 –, max. 1 old file; must stay set that way), Matomo with IP anonymisation by 2 bytes (must be set that way in Matomo), cookie section `#cookies`.
- `web/public/.htaccess`: enforce HTTPS, `www` -> without `www`, `ErrorDocument 404 /404.html`, cache for `/_astro/`.
- **Channel redirects on Cloud86 are real HTTP 302s** instead of meta refresh (which briefly showed a white page): `channels-output.ts` appends a `RewriteRule` to `dist/.htaccess` at build time for every page × channel (source: `channelRedirects`). 302 instead of 301, so browsers do not remember them permanently. Astro's meta-refresh pages stay in `dist/` as a fallback. Tested locally with Apache 2.4 (302, with/without trailing slash, 404, www, cache).
- **Rewriting foreign sources:** Instagram itself appends `utm_source=ig&utm_medium=social&utm_content=link_in_bio` to the bio link (observed in Matomo). `foreignSources` in `channels.ts` maps such values to a channel of our own (`ig` -> `instagram`); `channels-output.ts` generates a 302 rule in `dist/.htaccess` from it that redirects every page with `utm_source=ig` to the same page with the channel's values (other parameters such as `fbclid` are dropped). Tested locally with Apache 2.4. According to research, TikTok appends nothing to bio links (only to paid ads), so no entry. Still, always put `/q/instagram` or `/q/tiktok` into the bios.
- `analytics/` and `deploy/deploy.sh` remain as an alternative for an own server, but are **not in use** and no longer match the site's Matomo integration.

## Content round October 2026 (can be changed at any time)

- **Spelling everywhere "Straussi" (with ss)**, never "Straußi" (the client's wish). **The residences are also called "Straussi" on the site** ("Studierendenwohnheime Straussi", "Straussi-Wohnheime", "Straussi 1, 2 und 3", EN "Straussi student residences"), not "Straußäcker" (the client's wish, November 2026; there is no street of that name, the address is Universitätsstraße 94). Exceptions we cannot change: the label in the OSM map image, the text in the ticket shop.
- **No admission under 18**, not even when accompanied; must be stated clearly like that (info, FAQ, ABC).
- **No admission times** on the site (deliberately removed). Prohibited items list: „Waffen jeglicher Art“ (weapons of any kind), plus (wanted as a joke) **Sperrgut** (bulky waste).
- **Festival ABC with letter bar** (`web/src/components/FestivalAbc.astro`): the `<dt>`/`<dd>` pairs stay normal HTML in `faq.astro`; at build time the component sets jump targets `abc-<letter>` on the first keyword per letter and builds the bar (letters without an entry greyed out). The bar sticks to the top while scrolling (`position: sticky`), on mobile a swipeable row, from 48rem all 26 in one row.
- **Page for residents** (`web/src/pages/bewohner.astro`), marked as „bald“ (soon) in the menu, content still TODO.
- **`docs/STYLE.md`** for contributors (interactive site map): colours/roles, typography, spacing, building blocks, accessibility and above all **no third-party maps (Google Maps, OSM tiles, CDN)**, recommendation: own SVG map.

## UTM forwarding to the ticket shop (permanently on)

- **Ticket shop:** `https://straussifestival.dein-ticket.shop/events/straussifestival-111/straussifestival-111` (`ticket.url`). Advance sales running since 2026-10-20. **Prices deliberately not on the site**, early bird dropped.
- **`ticket.forwardUtm: true`** (permanently, the client's wish). `UtmForwarding.astro` appends the marketing channel to all `a[data-ticket-link]`: **without consent** only the UTMs of the current address (nothing stored), **with consent** in the cookie banner additionally for the visit in **sessionStorage** (`straussi-werbeweg`, deleted when the tab is closed or on revocation). Reason: storing in the browser requires consent under § 25 TDDDG. Banner text, `bannerActive` and the privacy policy (section ticket shop) accordingly. Tested in the browser (without/with consent, revocation, new tab).
- **Information for the shop operator:** `docs/TICKETSHOP-UTM.md` (German; extend the table there when adding new channels).

## Ticket redirect (redirect-ticket)

- **`web/src/pages/redirect-ticket.astro`**: like `redirect-instagram`, but the target is the ticket shop. Intended for links on third-party sites that lead directly to purchase: `/redirect-ticket/q/rausgegangen`, `/redirect-ticket/q/studentenpartys-stuttgart` (works automatically for every channel). Counts a page view + event **category `Ticket`, action `Weiterleitung`** (`analytics.ticketRedirectAction`) and appends the UTMs of its own address to the shop link (nothing stored), then `location.replace`. Fallback without JS: meta refresh after 3 s without UTMs. The privacy policy has a section on it. Tested in the browser.

## Ticket words in the text as links

- Every word containing „Ticket“ in body text (Tickets, Ticketshop, Tagestickets, Wochenendtickets, Ticketarten, „Tickets kaufen“) is a link to the shop via **`<TicketLink>`** (`web/src/components/TicketLink.astro`), on the home page, info, FAQ/ABC and in the footer. **Not** linked: headings, page descriptions and the privacy policy.
- `TicketLink` carries `data-ticket-link` and `data-position="text"`: it counts in Matomo as the event "Ticket / Klick / text" and gets the UTMs like the buttons. Without a real ticket URL, plain text. Link new text passages containing „Ticket“ the same way.
- **Exception „Ticketpartner“** (footer and home page, EN „ticket partner“): a plain link to the provider's general page **`https://dein-ticket.shop/`** (`ticket.partnerUrl` in `config.ts`, new tab), not to our event (the client's wish). Not a `TicketLink`, so no ticket click event and no UTMs; Matomo only counts it as an outbound link.

## English version (complete, including legal pages)

- **English pages live in `web/src/pages/en/`** with the same file names as the German ones (`/en/`, `/en/infos/`, `/en/faq/` …). All pages are translated, including imprint and privacy policy; there it says at the top that the **German version is legally binding**. Translated by Claude, **still to be proofread**.
- **Texts of the shared building blocks** (menu, footer, ticket button, banner, countdown, Instagram section, ABC bar) are in both languages in **`web/src/i18n.ts`** (`TEXTS.de` / `TEXTS.en`). The language follows from the address (`languageOf(Astro.url)`: `/en/…` = English). Internal menu links via `localPath()`.
- **The home page** is now a shared building block **`web/src/components/HomePage.astro`** (hero, countdown, Instagram section, scripts for fade-in/parallax); `pages/index.astro` and `pages/en/index.astro` only contain their text.
- **Language switch** DE/EN as the last item in the main menu (header), leads to the same page in the other language; plus `hreflang` links in the head. On the 404 page (one page, bilingual) there is no switch.
- **Maintenance:** make every content change to a page **in both languages**. New page = German and English file, otherwise the switch leads nowhere.
- Channel redirects (`/q/…`) and QR codes exist only for the German pages (`pages.ts` only reads the top level of `src/pages/`); printed codes lead to German, visitors switch via the language switch.
- The photos in the hero only have German alt texts (`heroImages` in `config.ts`).

## FAQ collapsible, contact in the footer

- FAQ questions are `<details class="faq-question">` with `<summary>` (without JavaScript), plus/minus in yellow; the festival ABC stays open.
- Footer, Contact column: `info@`, below it **Acts** (`acts@straussifestival.de`) and **Sponsoring** (`sponsorings@straussifestival.de`, as given by the client, "with s at the end"). Addresses centrally in `festival.email`, `festival.emailActs`, `festival.emailSponsoring` (`config.ts`).

## Map and calendar button (November 2026, can be changed at any time)

- **Map on the directions page** (`web/src/components/LocationMap.astro`): own image `web/public/anfahrt/karte.webp` (OpenStreetMap excerpt with pink marker, generated with `web/tools/make_map.py`, which deliberately does not live in `public/`), below it the buttons „Google Maps“, „Apple Karten“, „OpenStreetMap“ (links only, they open the address in the map app). **No embedded map** (chosen so by the client: no consent needed). The attribution „© OpenStreetMap-Mitwirkende“ is a licence requirement. Address in `festival.address`, coordinates in `locationMap` (`config.ts`).
- **Button „In den Kalender eintragen“** (add to calendar) (`web/src/components/CalendarButton.astro`) only below the countdown on the home page (removed again from the directions page on request). Collapsible without JavaScript (`<details>`): Google Calendar link and `/kalender.ics` (endpoint `web/src/pages/kalender.ics.ts`, for Apple, Outlook, Android). **All-day** 2027-06-11 to 2027-06-12 (`calendar` in `config.ts`), as long as there are no times. Matomo event category `Kalender`, action `Eintrag`, name `google`/`ics`.
- The privacy policy (DE/EN) has a section „Karte und Kalendereintrag“ (map and calendar entry).
- The directions page has been live since 2026-11-16 (menu, home page and FAQ link to it). The cycling section is only a comment in the file (not visible) until clarified.

## Channels with target Instagram (`target` in `channels.ts`, November 2026)

- A channel can get `target: 'instagram'` (or `'ticket'`). Then **`/q/<slug>`** does not lead to the home page, but via 302 to `/redirect-instagram/?utm_…` (or `/redirect-ticket/`) and is counted and redirected there as usual. `<page>/q/<slug>` behind other pages stays unchanged. Logic in `targetPath()` (`channels.ts`), affects `.htaccess` rules, Astro fallback pages and `docs/channels.md`.
- **Currently: `sticker`** (since 2026-11-18, the already printed sticker codes now lead to Instagram), **`visitenkarte-insta`** (next to `visitenkarte`, which leads to the website), **`blockparty-str2`**, **`netthier`** and **`maschinenbau`** (for the last three, the old links `/redirect-instagram/q/<slug>` remain valid). Since then, sticker scans count in Matomo as the event Instagram / Weiterleitung, no longer as a home page visit.
- `/q/instagram` deliberately stays **without** `target`: the link is in the Instagram bio and must lead to the website (otherwise a loop back to Instagram).
- Deliberately no real direct redirect to instagram.com without our page: then Matomo would not run and the scan would not be counted.

## Commands (in the `web/` folder)

```
npm install          install dependencies
npm run dev          local development server
npm run build        check (astro check) and build into web/dist/; also generates docs/qr/ and docs/channels.md
npm run preview      view the built site locally
```

Deployment: see `deploy/PLESK.md` (build, ZIP from `web/dist/`, upload to `httpdocs` in Plesk and extract).

## Notes on content (Astro pages)

- Each page lives in `web/src/pages/<name>.astro`. The file name is the address (`infos.astro` -> `/infos/`, `index.astro` is the home page). The text is directly in the file as HTML between `<div class="wrap prose">` and `</div>`: `<h2>` for subheadings, `<p>` for paragraphs, `<ul><li>` for lists. Page text is German (English in `web/src/pages/en/`).
- The head of the file (between the `---`) and the line `<Base title="..." description="...">` set title and description.
- Curly braces `{` and `}` are special characters in Astro texts. Avoid them in the text or write them as `{'{'}`.
- **New page:** create a file in `web/src/pages/` (easiest: copy `infos.astro`), plus its English counterpart in `web/src/pages/en/`, and add **one line to the navigation list** in `web/src/layouts/Base.astro` (`mainMenu` or `footerMenu`). Without this line the page exists, but nothing links to it.
- **Page not finished yet:** in the menu (`mainMenu` in `Base.astro`) set `soon: true`. The item then appears greyed out with „bald“ (soon) and is not a link (header and footer). Currently so: line-up and residents. The pages themselves remain reachable at their addresses; links to them in body text were removed (comments at those places in `index.astro` and `faq.astro` show what needs to go back in).
- Subheadings no longer get automatic anchor `id`s (they were automatic with Markdown, but were not used anywhere).

## Open items

See `docs/SPEC.md`. Do not invent any of it, always leave it as TODO.
