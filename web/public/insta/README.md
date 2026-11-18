# Photos for the Instagram section

This is where the photos go that appear as tiles on the home page under
„Bleib auf dem Laufenden“ (stay in the loop).

1. Put the photo here, ideally in portrait format (about 3:4) and no wider than 1000 pixels.
   File name without umlauts and spaces, e.g. `buehne-2025.jpg`.
2. Add it in `web/src/config.ts` in the `instagram` block under `photos`:

   ```ts
   photos: [
     { image: '/insta/buehne-2025.jpg', alt: 'Volle Tanzfläche vor der Bühne' },
   ],
   ```

The `alt` text describes the photo for blind visitors and is shown
when the image does not load. Always fill it in (in German, like the page).

As long as fewer than five photos are entered, the free spots show
placeholders with "TODO Foto".

**Important:** only use your own photos or photos you have the rights to.
Anyone recognisable in the photo should agree to it.

## Real Instagram feed instead of tiles (optional)

Instead of the photos, the real feed of `@straussifestival` can appear here.
It is embedded via a free widget from a third-party provider and only loads
once visitors consent in the cookie banner.

1. At **LightWidget** (lightwidget.com, decided) create a free
   account, connect it to the Instagram account and create a widget
   (layout e.g. "Slideshow"/"Carousel" or grid, depending on what the free plan offers).
2. Copy the embed code and look for the address in `src="..."` of the `<iframe>`.
3. Add it in `web/src/config.ts` in the `instagram` block under `widget`:

   ```ts
   widget: {
     url: 'https://...the address from src...',
     provider: 'LightWidget',
     height: 420,
   },
   ```

   `height` is the height in pixels; adjust it until nothing is cut off.
4. Rebuild and deploy. The banner and the privacy section then appear automatically.
   **Before publishing**, resolve the TODOs in the „Instagram-Feed“ section of the
   privacy page and have it legally reviewed.

To switch it off, set `url` back to `''`.
