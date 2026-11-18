# Website style guide

For everyone building something new for the site (e.g. the **interactive site map**), so that it looks and behaves like the rest. All values are CSS custom properties at the top of `web/src/styles/global.css`. **Always use the variables, never raw colour values.** Then a later colour change carries over automatically.

## Principles

- **Dark theme only.** There is no light theme (`color-scheme: dark`).
- **Mobile first.** Most guests arrive by QR code on their phone. Build for the phone first (about 360–400 px wide), then extend for larger screens.
- **Simple and fast:** system fonts, no CSS framework, no UI framework (no React/Vue), as little JavaScript as possible. Keep images small.
- **Load nothing from third-party servers** (fonts, scripts, maps, images, videos), see [Privacy](#privacy-important-for-the-map). The site has a cookie banner only for our own analytics and the Instagram feed; anything else would first need legal clarification.
- Language: code comments and identifiers in **English** (e.g. `stage`, `location`, `description`). Visible page text is **German** (with the English version under `/en/`). Spelling: **Straussi** (with ss), also for the residences ("Straussi-Wohnheime", "Straussi 1, 2 und 3"), never "Straußi" or "Straußäcker".

## Colours

| Variable | Value | Role |
| --- | --- | --- |
| `--color-background` | `#1b1c20` | page background |
| `--color-surface` | `#2c2d33` | raised surfaces: header/footer, cards, panels |
| `--color-surface-light` | `#676a79` | tiles, round icon buttons |
| `--color-line` | `#41434b` | dividers, borders |
| `--color-text` | `#eceded` | body text |
| `--color-text-muted` | `#ababaf` | secondary text, labels, inactive items |
| `--color-accent` | `#f3e007` (yellow) | **Action:** buttons, everything clickable, focus ring, countdown |
| `--color-accent-dark` | `#2a2700` | text **on** yellow surfaces |
| `--color-accent-two` | `#ee0ce3` (pink) | **Highlight:** links, emphasised text, keywords |
| `--color-accent-two-light` | `#f97bf3` | pink on the lighter surfaces (hover/active in header and footer) |

**Do not mix the roles:** yellow means "you can do something here", pink means "this is important/selected". For the map, for example: outline clickable places in yellow, highlight the currently selected place in pink.

**Contrast:** body text needs at least 4.5:1 (WCAG). Checked and allowed: text, muted text, yellow and pink on `--color-background`; dark text on yellow. **No pink text on `--color-surface`**, the contrast is too low (use `--color-accent-two-light` there). Check the contrast for new combinations (e.g. with the WebAIM Contrast Checker).

## Typography

- Font: system font (`system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif`), nothing loaded.
- Base size 1.0625rem (17 px), line height 1.65.
- Headings in text pages (`.prose`): `h1` `clamp(1.9rem, 7vw, 2.6rem)`, `h2` 1.35rem, `h3` 1.1rem, bold.
- Small labels in capitals (like the countdown tiles and „BALD“): `text-transform: uppercase; letter-spacing: 0.05em;` in a small font size.

## Spacing, widths, radii

| Variable | Value | Used for |
| --- | --- | --- |
| `--spacing` | 1.25rem | left/right padding, base spacing |
| `--width` | 46rem | text column (`.wrap`) |
| `--width-large` | 68rem | wide content, e.g. a map (`.wrap-wide`) |
| `--radius` | 1rem | normal rounding (cards, images) |
| `--radius-large` | 1.5rem | large colour areas (Instagram panel) |

Buttons and badges are fully rounded (`border-radius: 999px`), round icon buttons `50%`.

**Breakpoints** (mobile first, so `min-width`):
- `40rem` (640 px): tablet, e.g. multi-column footer
- `48rem` (768 px): e.g. the letter bar in the festival ABC on one line

## Existing building blocks

- **Buttons:** `<a class="button">` (yellow, dark text), sizes `button-small` and `button-large`. For actual buttons `<button class="button">`. Hover = slight shadow and lift, **no colour change**.
- **Greyed out / not yet available:** `button-disabled`, or the pattern from the menu: muted text, `opacity`, small „BALD“ (soon) badge.
- **Focus ring:** `outline: 3px solid var(--color-accent); outline-offset: 3px;`. Your own clickable elements (including SVG areas) must show a visible focus.
- **Text pages:** content inside `<div class="wrap prose">`.
- **Logo:** `web/public/logo.webp` (large), `web/public/logo-klein.png` (small).
- **Fade in on scroll:** class `fade-in` (only active on the home page, see `web/src/components/HomePage.astro`).

## Motion and accessibility

- Animations only inside `@media (prefers-reduced-motion: no-preference)`. Anyone who has reduced motion enabled gets everything without motion (no zoom flight, no parallax).
- **Touch:** tap targets at least about 2.75rem (44 px). **Show nothing on hover only:** phones have no hover. Information opens on tap/click.
- **Keyboard:** everything clickable must be reachable with Tab and triggerable with Enter/Space. Use real `<button>` or `<a>` elements, no clickable `<div>`s.
- **Screen readers:** images with `alt` text; icon-only buttons with `aria-label`.
- **Without JavaScript** the essentials must still be there (e.g. the map as an image plus a list of places below it).

## Privacy (important for the map)

The site deliberately gets by with few consents. Therefore:

- **No embedded third-party maps:** no Google Maps, no OpenStreetMap tile server, no Mapbox, no libraries or tiles from a CDN. All of these load data from third-party servers and transmit the visitors' IP address. That would only be possible with consent in the cookie banner and a new section in the privacy policy.
- **Recommendation for the site map:** an **own SVG graphic** of the grounds (stages, bars, info stand, first aid, toilets, entrances …), embedded directly in an Astro component, plus a little vanilla JavaScript for interaction (tap a place → show info). That is fast, sharp on every screen, privacy-friendly and matches the colours through the CSS variables.
- If a library really is needed: install it via `npm` and bundle it, **never include it via a CDN link**.

## How the map would be built in

- Component e.g. `web/src/components/SiteMap.astro` (markup + `<style>` + `<script>` in one file, like the other components).
- Include it on the page `web/src/pages/anfahrt.astro` (the directions page) or on a new page of its own. New page = new file in `web/src/pages/` plus one line in the menu in `web/src/layouts/Base.astro`.
- Images/graphics in `web/public/` (e.g. `web/public/gelaende/`), preferably as SVG; scale photos down beforehand (max. about 1200 px wide).
- **No invented content:** positions of stages, stands etc. only as the team decides them. Mark anything still missing as `TODO`.
- View locally: in the `web/` folder `npm install`, then `npm run dev` (http://localhost:4321). Before uploading, `npm run build`. It aborts on errors.
