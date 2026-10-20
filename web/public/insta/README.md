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

## Echter Instagram-Feed statt Kacheln (optional)

Statt der Fotos kann hier auch der echte Feed von `@straussifestival` erscheinen.
Er wird über ein kostenloses Widget eines Drittanbieters eingebunden und lädt erst,
wenn Besucher im Cookie-Banner zustimmen.

1. Bei **LightWidget** (lightwidget.com, so entschieden) ein kostenloses
   Konto anlegen, mit dem Instagram-Konto verbinden und ein Widget erstellen
   (Layout z. B. „Slideshow“/„Carousel“ oder Raster, je nachdem, was der Gratis-Tarif anbietet).
2. Den Einbettungscode kopieren und darin die Adresse bei `src="..."` des `<iframe>` suchen.
3. In `web/src/config.ts` im Block `instagram` bei `widget` eintragen:

   ```ts
   widget: {
     url: 'https://...die Adresse aus src...',
     anbieter: 'LightWidget',
     hoehe: 420,
   },
   ```

   `hoehe` ist die Höhe in Pixeln; anpassen, bis nichts abgeschnitten wird.
4. Neu bauen und deployen. Banner und Datenschutz-Abschnitt erscheinen dann von selbst.
   **Vor dem Veröffentlichen** die TODOs im Abschnitt „Instagram-Feed“ der
   Datenschutzseite erledigen und rechtlich prüfen lassen.

Zum Abschalten `url` wieder auf `''` setzen.
