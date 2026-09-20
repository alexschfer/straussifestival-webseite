# Fotos für den Instagram-Abschnitt

Hier kommen die Fotos hinein, die auf der Startseite unter "Bleib auf dem Laufenden"
als Kacheln erscheinen.

1. Foto hier ablegen, am besten im Hochformat (ca. 3:4) und nicht größer als 1000 Pixel breit.
   Dateiname ohne Umlaute und Leerzeichen, z. B. `buehne-2025.jpg`.
2. In `web/src/config.ts` im Block `instagram` bei `fotos` eintragen:

   ```ts
   fotos: [
     { bild: '/insta/buehne-2025.jpg', alt: 'Volle Tanzfläche vor der Bühne' },
   ],
   ```

Der Text bei `alt` beschreibt das Foto für blinde Besucher und wird angezeigt,
wenn das Bild nicht lädt. Bitte immer ausfüllen.

Solange weniger als fünf Fotos eingetragen sind, stehen an den freien Stellen
Platzhalter mit "TODO Foto".

**Wichtig:** Nur eigene Fotos verwenden oder solche, für die ihr die Rechte habt.
Wer auf dem Foto erkennbar ist, sollte damit einverstanden sein.
