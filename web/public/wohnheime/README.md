# Photos for the hero screen

This folder holds our own photos that appear at the very top of the home page as a
background collage behind the title and date (three image columns with a parallax
effect when scrolling).

1. Put the photo here, landscape, no wider than about 1200 pixels and
   compressed (JPEG, quality about 70), so that the home page also loads quickly on
   phones via QR code. File name without umlauts and spaces, e.g. `hof-4.jpg`.

   Small Python/Pillow snippet for scaling down and compressing:

   ```python
   from PIL import Image, ImageOps
   image = ImageOps.exif_transpose(Image.open('original.jpg')).convert('RGB')
   image.thumbnail((1200, 1200))
   image.save('web/public/wohnheime/hof-4.jpg', 'JPEG', quality=70, optimize=True, progressive=True)
   ```

2. Add it in `web/src/config.ts` in the `heroImages` block:

   ```ts
   heroImages: [
     { image: '/wohnheime/hof-4.jpg', alt: 'Kurze, wahrheitsgemäße Beschreibung des Fotos' },
   ],
   ```

The `alt` text describes what can actually be seen in the photo (no invented
place names, in German like the page) and is shown when the image does not load.

Currently `party-1.jpg`, `party-2.jpg` and `party-3.jpg` are entered: party photos from the
summer parties of Straussi 1 and Straussi 2 (laser stage, ostrich figure, band with audience).
They are cropped to portrait format (2:3, 1000 x 1500 pixels) because the collage consists of
three tall columns; landscape photos would be enlarged a lot there and look blurry.

**No sponsors:** no sponsors may be visible in the photos (logos on umbrellas,
banners, bottles, fridges etc.).

**Important:** only use your own photos or photos you have the rights to. Anyone
recognisable in the photo should agree to it.
