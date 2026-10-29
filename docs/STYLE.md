# Style-Guide der Webseite

Für alle, die etwas Neues für die Seite bauen (z. B. die **interaktive Geländekarte**), damit es aussieht und sich verhält wie der Rest. Alle Werte stehen als CSS-Variablen oben in `web/src/styles/global.css`. **Immer die Variablen benutzen, nie Farbwerte direkt.** Dann passt ein späterer Farbwechsel automatisch.

## Grundsätze

- **Nur dunkles Thema.** Es gibt kein helles Thema (`color-scheme: dark`).
- **Mobil zuerst.** Die meisten Gäste kommen per QR-Code vom Handy. Erst fürs Handy (ca. 360–400 px breit) bauen, dann für größere Bildschirme erweitern.
- **Schlicht und schnell:** Systemschriften, kein CSS-Framework, kein UI-Framework (kein React/Vue), so wenig JavaScript wie möglich. Bilder klein halten.
- **Nichts von fremden Servern laden** (Schriften, Skripte, Karten, Bilder, Videos), siehe [Datenschutz](#datenschutz-wichtig-für-die-karte). Die Seite hat einen Cookie-Banner nur für unsere Statistik und den Instagram-Feed; alles Weitere müsste erst rechtlich geklärt werden.
- Sprache in Texten, Code-Kommentaren und Bezeichnern: **Deutsch** (z. B. `buehne`, `standort`, `beschreibung`). Schreibweise: **Straussi** (mit ss), die Wohnheime heißen **Straußäcker**.

## Farben

| Variable | Wert | Rolle |
| --- | --- | --- |
| `--farbe-hintergrund` | `#1b1c20` | Seitenhintergrund |
| `--farbe-flaeche` | `#2c2d33` | abgesetzte Flächen: Kopf-/Fußzeile, Karten, Panels |
| `--farbe-flaeche-hell` | `#676a79` | Kacheln, runde Symbolknöpfe |
| `--farbe-linie` | `#41434b` | Trennlinien, Rahmen |
| `--farbe-text` | `#eceded` | Fließtext |
| `--farbe-text-leise` | `#ababaf` | Nebentext, Beschriftungen, Inaktives |
| `--farbe-akzent` | `#f3e007` (Gelb) | **Aktion:** Buttons, alles Anklickbare, Fokusring, Countdown |
| `--farbe-akzent-dunkel` | `#2a2700` | Text **auf** gelben Flächen |
| `--farbe-akzent-zwei` | `#ee0ce3` (Pink) | **Hervorhebung:** Links, hervorgehobener Text, Stichwörter |
| `--farbe-akzent-zwei-hell` | `#f97bf3` | Pink auf den helleren Flächen (Hover/Aktiv in Kopf- und Fußzeile) |

**Rollen nicht vermischen:** Gelb heißt „hier kann man etwas tun“, Pink heißt „das ist wichtig/ausgewählt“. Für die Karte z. B.: anklickbare Orte gelb umranden, den gerade ausgewählten Ort pink hervorheben.

**Kontrast:** Fließtext braucht mindestens 4,5:1 (WCAG). Geprüft und erlaubt: Text, leiser Text, Gelb und Pink auf `--farbe-hintergrund`; dunkler Text auf Gelb. **Pink nicht auf `--farbe-flaeche`** für Text, das reicht nicht (dort `--farbe-akzent-zwei-hell`). Bei neuen Kombinationen den Kontrast prüfen (z. B. mit dem WebAIM Contrast Checker).

## Schrift

- Schrift: Systemschrift (`system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif`), nichts nachladen.
- Grundgröße 1.0625rem (17 px), Zeilenhöhe 1.65.
- Überschriften in Textseiten (`.prose`): `h1` `clamp(1.9rem, 7vw, 2.6rem)`, `h2` 1.35rem, `h3` 1.1rem, fett.
- Kleine Labels in Versalien (wie bei den Countdown-Kacheln und „BALD“): `text-transform: uppercase; letter-spacing: 0.05em;` in kleiner Schrift.

## Abstände, Breiten, Rundungen

| Variable | Wert | Wofür |
| --- | --- | --- |
| `--abstand` | 1.25rem | Innenabstand links/rechts, Grundabstand |
| `--breite` | 46rem | Textspalte (`.wrap`) |
| `--breite-gross` | 68rem | breite Inhalte, z. B. eine Karte (`.wrap-breit`) |
| `--radius` | 1rem | normale Rundung (Karten, Bilder) |
| `--radius-gross` | 1.5rem | große Farbflächen (Instagram-Feld) |

Buttons und Abzeichen sind ganz rund (`border-radius: 999px`), runde Symbolknöpfe `50%`.

**Breakpoints** (mobil zuerst, also `min-width`):
- `40rem` (640 px): Tablet, z. B. Fußzeile mehrspaltig
- `48rem` (768 px): z. B. Buchstabenleiste im Festival-ABC einzeilig

## Bausteine, die es schon gibt

- **Buttons:** `<a class="button">` (gelb, dunkler Text), Größen `button-klein` und `button-gross`. Für Knöpfe `<button class="button">`. Hover = leichter Schatten und Anheben, **keine Farbänderung**.
- **Ausgegraut / noch nicht verfügbar:** `button-aus` bzw. das Muster aus dem Menü: leiser Text, `opacity`, kleines Abzeichen „BALD“.
- **Fokusring:** `outline: 3px solid var(--farbe-akzent); outline-offset: 3px;`. Bei eigenen anklickbaren Elementen (auch SVG-Flächen) muss der Fokus sichtbar sein.
- **Textseiten:** Inhalt in `<div class="wrap prose">`.
- **Logo:** `web/public/logo.webp` (groß), `web/public/logo-klein.png` (klein).
- **Einblenden beim Scrollen:** Klasse `einblenden` (nur auf der Startseite aktiv, siehe `index.astro`).

## Bewegung und Barrierefreiheit

- Animationen nur innerhalb von `@media (prefers-reduced-motion: no-preference)`. Wer reduzierte Bewegung eingestellt hat, bekommt alles ohne Bewegung (kein Zoom-Flug, kein Parallax).
- **Touch:** Tippflächen mindestens ca. 2.75rem (44 px) groß. **Nichts nur per Hover** zeigen: Auf dem Handy gibt es kein Hover. Infos öffnen per Tippen/Klick.
- **Tastatur:** alles Anklickbare auch per Tab erreichbar und mit Enter/Leertaste auslösbar. Echte `<button>` oder `<a>` benutzen, keine klickbaren `<div>`s.
- **Screenreader:** Bilder mit `alt`-Text; reine Symbol-Knöpfe mit `aria-label`.
- **Ohne JavaScript** muss das Wichtigste trotzdem da sein (z. B. die Karte als Bild plus eine Liste der Orte darunter).

## Datenschutz (wichtig für die Karte)

Die Seite kommt bewusst mit wenig Einwilligungen aus. Deshalb:

- **Keine eingebetteten Fremd-Karten:** kein Google Maps, kein OpenStreetMap-Kartenserver, kein Mapbox, keine Bibliotheken oder Kacheln von einem CDN. All das lädt Daten von fremden Servern und überträgt dabei die IP-Adresse der Besucher. Das ginge nur mit Einwilligung im Cookie-Banner und einem neuen Abschnitt in der Datenschutzerklärung.
- **Empfehlung für den Geländeplan:** eine **eigene SVG-Grafik** des Geländes (Bühnen, Bars, Infostand, Erste Hilfe, Toiletten, Eingänge …), direkt in eine Astro-Komponente eingebettet, dazu ein kleines Vanilla-JavaScript für die Interaktion (Ort antippen → Infos anzeigen). Das ist schnell, scharf auf jedem Bildschirm, datenschutzfreundlich und passt farblich über die CSS-Variablen.
- Braucht es doch eine Bibliothek: über `npm` installieren und mitbauen lassen, **nie per CDN-Link** einbinden.

## Wie die Karte eingebaut würde

- Komponente z. B. `web/src/components/Gelaendeplan.astro` (Markup + `<style>` + `<script>` in einer Datei, wie die anderen Komponenten).
- Einbinden auf der Seite `web/src/pages/anfahrt.astro` (ist im Menü noch „bald“) oder auf einer eigenen neuen Seite. Neue Seite = neue Datei in `web/src/pages/` plus eine Zeile im Menü in `web/src/layouts/Base.astro`.
- Bilder/Grafiken in `web/public/` (z. B. `web/public/gelaende/`), möglichst als SVG; Fotos vorher verkleinern (max. ca. 1200 px breit).
- **Keine erfundenen Inhalte:** Positionen von Bühnen, Ständen usw. nur so, wie das Team sie festlegt. Was noch fehlt, als `TODO` kennzeichnen.
- Lokal ansehen: im Ordner `web/` `npm install`, dann `npm run dev` (http://localhost:4321). Vor dem Hochladen `npm run build`. Er bricht bei Fehlern ab.
