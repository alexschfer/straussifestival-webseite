"""
Generates the map image for the directions page (web/public/anfahrt/karte.webp) from
OpenStreetMap tiles and puts a pink marker on the festival grounds.

Only needed if the map section or the marker should change. Needs Python with
Pillow (pip install pillow) and curl. Run from the web/ folder:

    python3 tools/make_map.py public/anfahrt/karte.webp

Downloads about 12 tiles once from tile.openstreetmap.org (allowed for individual requests,
not for bulk downloads). The attribution "© OpenStreetMap-Mitwirkende" below the image
(components/LocationMap.astro) is mandatory. Marker coordinates also in src/config.ts (locationMap).
"""
import math
import subprocess
import sys
import tempfile
import time
from pathlib import Path

from PIL import Image, ImageDraw

ZOOM = 17
CENTER = (48.7428, 9.1030)  # image centre: grounds and S-Bahn Universität both fit
GROUNDS = (48.74276, 9.10169)  # marker: centre of the Straussi 1–3 residences
WIDTH, HEIGHT = 800, 600
PINK = (238, 12, 227)


def pixel(lat, lon):
    n = 2**ZOOM * 256
    x = (lon + 180) / 360 * n
    y = (1 - math.asinh(math.tan(math.radians(lat))) / math.pi) / 2 * n
    return x, y


def main(target):
    cx, cy = pixel(*CENTER)
    x0, y0 = int(cx - WIDTH / 2), int(cy - HEIGHT / 2)
    image = Image.new('RGB', (WIDTH, HEIGHT))
    folder = Path(tempfile.mkdtemp())
    for tx in range(x0 // 256, (x0 + WIDTH) // 256 + 1):
        for ty in range(y0 // 256, (y0 + HEIGHT) // 256 + 1):
            tile = folder / f'{tx}_{ty}.png'
            subprocess.run(
                ['curl', '-sf', '-A', 'straussi-website-build/1.0', '-o', str(tile),
                 f'https://tile.openstreetmap.org/{ZOOM}/{tx}/{ty}.png'],
                check=True,
            )
            time.sleep(0.5)
            image.paste(Image.open(tile).convert('RGB'), (tx * 256 - x0, ty * 256 - y0))

    draw = ImageDraw.Draw(image, 'RGBA')
    gx, gy = pixel(*GROUNDS)
    gx, gy = gx - x0, gy - y0
    draw.ellipse([gx - 90, gy - 90, gx + 90, gy + 90], fill=PINK + (28,), outline=PINK + (255,), width=4)
    # Pin
    draw.ellipse([gx - 16, gy - 52, gx + 16, gy - 20], fill=PINK + (255,), outline=(27, 28, 32, 255), width=3)
    draw.polygon([(gx - 11, gy - 28), (gx + 11, gy - 28), (gx, gy - 4)], fill=PINK + (255,))
    draw.ellipse([gx - 6, gy - 42, gx + 6, gy - 30], fill=(255, 255, 255, 255))
    image.save(target, 'WEBP', quality=80)
    print(target, Path(target).stat().st_size, 'bytes')


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else 'public/anfahrt/karte.webp')
