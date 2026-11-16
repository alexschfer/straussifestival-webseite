# Karte für die Anfahrt-Seite

`karte.webp` ist ein Ausschnitt aus OpenStreetMap mit pinker Markierung auf dem
Festivalgelände. Es ist ein ganz normales Bild auf unserem eigenen Webspace: Beim
Ansehen wird nichts von fremden Servern geladen, deshalb braucht es keine Zustimmung
im Cookie-Banner. Angezeigt wird es von `web/src/components/Karte.astro`, zusammen mit
Knöpfen zu Google Maps, Apple Karten und OpenStreetMap.

- **Neu erzeugen** (anderer Ausschnitt, andere Markierung): Skript `web/werkzeug/karte.py`,
  Anleitung oben in der Datei. Koordinaten dann auch in `web/src/config.ts` (`karte`) anpassen.
- **Eigenes Bild** (z. B. ein gezeichneter Lageplan): Datei hier ablegen und in
  `web/src/config.ts` bei `karte` Dateiname, Breite und Höhe eintragen. Alt-Text in
  `web/src/i18n.ts` (`karteAlt`, Deutsch und Englisch) anpassen.
- Die Quellenangabe „© OpenStreetMap-Mitwirkende“ unter dem Bild muss bleiben, solange das
  Bild aus OpenStreetMap stammt (Lizenzbedingung).
- Keine eingebettete Google-/OSM-Karte einbauen, ohne vorher den Datenschutz zu klären
  (siehe `docs/STYLE.md`).
