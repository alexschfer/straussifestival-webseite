"""
Erzeugt das Kartenbild für die Anfahrt-Seite (web/public/anfahrt/karte.webp) aus
OpenStreetMap-Kacheln und setzt eine pinke Markierung auf das Festivalgelände.

Nur nötig, wenn sich Ausschnitt oder Markierung ändern sollen. Braucht Python mit
Pillow (pip install pillow) und curl. Aufruf aus dem Ordner web/:

    python3 werkzeug/karte.py public/anfahrt/karte.webp

Lädt einmalig rund 12 Kacheln von tile.openstreetmap.org (erlaubt für einzelne Abrufe,
nicht für Massenabrufe). Die Quellenangabe "© OpenStreetMap-Mitwirkende" unter dem Bild
(components/Karte.astro) ist Pflicht. Koordinaten der Markierung auch in src/config.ts (karte).
"""
import math
import subprocess
import sys
import tempfile
import time
from pathlib import Path

from PIL import Image, ImageDraw

ZOOM = 17
MITTE = (48.7428, 9.1030)  # Bildmitte: Gelände und S-Bahn Universität passen beide drauf
GELAENDE = (48.74265, 9.1015)  # Markierung: Mitte der Wohnanlagen Straußäcker I–III
BREITE, HOEHE = 800, 600
PINK = (238, 12, 227)


def pixel(breite, laenge):
    n = 2**ZOOM * 256
    x = (laenge + 180) / 360 * n
    y = (1 - math.asinh(math.tan(math.radians(breite))) / math.pi) / 2 * n
    return x, y


def main(ziel):
    cx, cy = pixel(*MITTE)
    x0, y0 = int(cx - BREITE / 2), int(cy - HOEHE / 2)
    bild = Image.new('RGB', (BREITE, HOEHE))
    ordner = Path(tempfile.mkdtemp())
    for tx in range(x0 // 256, (x0 + BREITE) // 256 + 1):
        for ty in range(y0 // 256, (y0 + HOEHE) // 256 + 1):
            datei = ordner / f'{tx}_{ty}.png'
            subprocess.run(
                ['curl', '-sf', '-A', 'straussi-website-build/1.0', '-o', str(datei),
                 f'https://tile.openstreetmap.org/{ZOOM}/{tx}/{ty}.png'],
                check=True,
            )
            time.sleep(0.5)
            bild.paste(Image.open(datei).convert('RGB'), (tx * 256 - x0, ty * 256 - y0))

    zeichnen = ImageDraw.Draw(bild, 'RGBA')
    gx, gy = pixel(*GELAENDE)
    gx, gy = gx - x0, gy - y0
    zeichnen.ellipse([gx - 90, gy - 90, gx + 90, gy + 90], fill=PINK + (28,), outline=PINK + (255,), width=4)
    # Stecknadel
    zeichnen.ellipse([gx - 16, gy - 52, gx + 16, gy - 20], fill=PINK + (255,), outline=(27, 28, 32, 255), width=3)
    zeichnen.polygon([(gx - 11, gy - 28), (gx + 11, gy - 28), (gx, gy - 4)], fill=PINK + (255,))
    zeichnen.ellipse([gx - 6, gy - 42, gx + 6, gy - 30], fill=(255, 255, 255, 255))
    bild.save(ziel, 'WEBP', quality=80)
    print(ziel, Path(ziel).stat().st_size, 'Bytes')


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else 'public/anfahrt/karte.webp')
