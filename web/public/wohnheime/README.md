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

Aktuell sind `hof-1.jpg`, `hof-2.jpg` und `hof-3.jpg` eingetragen: Fotos der
Wohnheim-Innenhöfe/Gebäude der Studierendenwohnheime Straußäcker.

**Wichtig:** Nur eigene Fotos verwenden oder solche, für die ihr die Rechte habt. Wer auf
dem Foto erkennbar ist, sollte damit einverstanden sein.
