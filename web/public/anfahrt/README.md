# Map for the directions page

`karte.webp` is an OpenStreetMap excerpt with a pink marker on the festival
grounds. It is a perfectly normal image on our own web space: viewing it loads
nothing from third-party servers, so it needs no consent in the cookie banner.
It is shown by `web/src/components/LocationMap.astro`, together with buttons to
Google Maps, Apple Maps and OpenStreetMap.

- **Regenerate** (different excerpt, different marker): script `web/tools/make_map.py`,
  instructions at the top of the file. Then also adjust the coordinates in
  `web/src/config.ts` (`locationMap`).
- **Own image** (e.g. a hand-drawn site plan): put the file here and enter the file name,
  width and height in `web/src/config.ts` under `locationMap`. Adjust the alt text in
  `web/src/i18n.ts` (`mapAlt`, German and English).
- The attribution „© OpenStreetMap-Mitwirkende“ (© OpenStreetMap contributors) below the
  image must stay as long as the image comes from OpenStreetMap (licence requirement).
- Do not add an embedded Google/OSM map without clarifying privacy first
  (see `docs/STYLE.md`).
