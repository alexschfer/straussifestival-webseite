# Fotos für den Startbildschirm

Hier liegen die eigenen Fotos, die auf der Startseite ganz oben als Hintergrund-Collage
hinter Titel und Datum erscheinen (drei Bildspalten mit Parallax-Effekt beim Scrollen).

1. Foto hier ablegen, quer/breit (Querformat), nicht größer als ca. 1200 Pixel breit und
   komprimiert (JPEG, Qualität ca. 70), damit die Startseite auch mobil per QR-Code schnell
   lädt. Dateiname ohne Umlaute und Leerzeichen, z. B. `hof-4.jpg`.

   Kleiner Python/Pillow-Einzeiler zum Verkleinern und Komprimieren:

   ```python
   from PIL import Image, ImageOps
   bild = ImageOps.exif_transpose(Image.open('original.jpg')).convert('RGB')
   bild.thumbnail((1200, 1200))
   bild.save('web/public/wohnheime/hof-4.jpg', 'JPEG', quality=70, optimize=True, progressive=True)
   ```

2. In `web/src/config.ts` im Block `startBilder` eintragen:

   ```ts
   startBilder: [
     { bild: '/wohnheime/hof-4.jpg', alt: 'Kurze, wahrheitsgemäße Beschreibung des Fotos' },
   ],
   ```

Der Text bei `alt` beschreibt, was tatsächlich auf dem Foto zu sehen ist (keine erfundenen
Ortsnamen) und wird angezeigt, wenn das Bild nicht lädt.

Aktuell sind `party-1.jpg`, `party-2.jpg` und `party-3.jpg` eingetragen: Partyfotos von den
Sommerfesten von Straußi 1 und Straußi 2 (Laserbühne, Strauß-Figur, Band mit Publikum). Sie sind
auf Hochformat (2:3, 1000 x 1500 Pixel) zugeschnitten, weil die Collage aus drei hohen Spalten
besteht; Querformat-Fotos würden dort stark vergrößert und unscharf.

**Keine Sponsoren:** Auf den Fotos dürfen keine Sponsoren zu sehen sein (Logos auf Schirmen,
Bannern, Flaschen, Kühlschränken usw.).

**Wichtig:** Nur eigene Fotos verwenden oder solche, für die ihr die Rechte habt. Wer auf
dem Foto erkennbar ist, sollte damit einverstanden sein.
