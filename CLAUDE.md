# Straussi Festival 2027: Webseite und Web-Analytics

## Kontext

Das Straussi Festival 2027 ist ein Festival der Studierendenwohnheime Straußäcker in Stuttgart, veranstaltet von einem Team aus Bewohner*innen von Straussi 1, 2 & 3, mit rund 7500 erwarteten Gästen.

Die Webseite ist eine **Infoseite**, die auf einen externen Ticketshop (dein-ticket.shop) verlinkt. Wichtigstes Ziel neben der Information: nachvollziehen, **über welchen Kanal** (Flyer, Aushänge, QR-Codes, Social Media) die Besucher kommen und **wie viele davon auf den Ticketbutton klicken**. Die meisten Besucher kommen per QR-Code vom Handy.

Das Team ist ehrenamtlich und teils nicht technisch. **Alles einfach und wartbar halten.**

## Grundregeln

- **Keine erfundenen Inhalte, Preise, Line-ups oder Daten.** Fehlendes als klar erkennbaren Platzhalter `TODO` setzen.
- **Keine Secrets im Repo.** Konfiguration über `.env`, im Repo nur `.env.example`.
- Arbeit in Phasen, **nach jeder Phase committen**. Bei fehlenden Entscheidungen nachfragen statt raten.
- Sprache von Seitentexten, Doku und Kommentaren: Deutsch.
- Sprechende Namen und Kommentare im Stil der vorhandenen Dateien beibehalten (deutsche Bezeichner in den Daten und in der Config, z. B. `kanaele`, `beschreibung`).

## Repo-Struktur

```
CLAUDE.md        dieser Projektkontext
README.md        Kurzanleitung: lokal starten, bauen, deployen
docs/SPEC.md     Aufgaben und Stand (inkl. offene Punkte)
docs/kanaele.md  Tabelle der Marketingkanäle (GENERIERT, nicht von Hand ändern)
docs/STYLE.md    Style-Guide (Farben, Schrift, Bausteine, Datenschutz-Regeln) für neue Bauteile, z. B. die interaktive Karte
docs/qr/         QR-Codes als SVG pro Kanal und Seite (GENERIERT)
web/             Astro-Seite
analytics/       docker-compose.yml, Caddyfile, backup.sh, .env.example, README.md
deploy/          deploy.sh, deploy.env.example, README.md (Anleitung)
```

## Entscheidungen (aus dem Auftrag)

### Web (Phase 1)

- Astro im statischen Modus (`output: 'static'`), TypeScript, **kein SSR, kein UI-Framework**, so wenig JavaScript wie möglich.
- Seiteninhalte als **einfache Astro-Seiten**: Jede Seite ist eine `.astro`-Datei unter `web/src/pages/` mit dem Inhalt direkt darin (HTML), dazu ein gemeinsames Layout `web/src/layouts/Base.astro`. **Keine Content Collections, kein Markdown** (auf Wunsch des Auftraggebers bewusst so umgestellt; nicht wieder einführen). Die Navigation ist eine kleine Liste im Layout. Seiten: Startseite (`index.astro`), Infos, FAQ, Anfahrt, Impressum, Datenschutz. Impressum mit den Angaben des Veranstalters **Straussi 1 e.V.** (übernommen aus https://straussi1.de/wohnheim/rechtliches/impressum, auf Wunsch des Auftraggebers); Datenschutz noch mit TODO-Platzhaltern.
- Responsives, schlichtes Layout, mobil zuerst. **Dunkles Thema** mit abgesetzten, abgerundeten Flächen (Kopfzeile, Instagram-Abschnitt, Fußzeile) und einem ruhigen türkisen Akzent; Vorbild war die Gestaltung von tiken.dev, ohne deren Schriften, Bilder oder Effekte zu übernehmen. Weiterhin Systemschriften, kein Framework.
- Ticketbutton prominent, verlinkt auf eine **zentral konfigurierte Ticket-URL** (`web/src/config.ts`, aktuell Platzhalter).

### Kanäle und Tracking (Kern)

- **Eine einzige Datenquelle** für alle Marketingkanäle: `web/src/data/kanaele.ts`. Pro Kanal: Slug, `utm_source`, `utm_medium`, `utm_content` (optional), Beschreibung.
- Daraus werden beim Build automatisch erzeugt:
  1. Redirects `<seite>/q/<slug>` -> `<seite>?utm_...` (`redirects`-Option in `astro.config.ts`). **`/q/<slug>` funktioniert hinter jeder Seite**, also `/q/mensa` (Startseite), `/lineup/q/mensa`, `/infos/q/mensa` usw. Die Seitenliste liest `web/integrations/seiten.ts` automatisch aus `src/pages/`; eine neue Seite bekommt ihre Weiterleitungen dadurch von selbst. Ein Kanal braucht dafür keinen Eintrag, die UTM-Parameter sind für jede Zielseite gleich.
  2. Ein QR-Code als SVG pro **gedrucktem Kanal (`utm_medium` `scan`)** und Seite (npm-Paket `qrcode`, Fehlerkorrektur Q, ca. 25 %; WhatsApp, Instagram, TikTok bekommen keinen QR-Code, ihre Links werden direkt geteilt): `docs/qr/<slug>.svg` für die Startseite, `docs/qr/<seite>/<slug>.svg` für die übrigen Seiten.
  3. `docs/kanaele.md`: Tabelle mit Slug, fertigem UTM-Link und QR-Datei.
  (2 und 3 erledigt die Integration `web/integrations/kanaele-output.ts` im Hook `astro:build:done`.)
- `utm_campaign` ist immer `straussi-festival-2027`.
- **Schreibregel für UTM-Werte** (und Slugs): nur Kleinbuchstaben (und Ziffern), keine Umlaute, kein ß, keine Leerzeichen, Wörter mit Bindestrich. Wird **beim Build per Validierung erzwungen** (`validiereKanaele` in `kanaele.ts`; der Build bricht bei Verstoß ab). Doppelte Slugs brechen den Build ebenfalls ab.
- **Kanäle (vom Team festgelegt):** ein Kanal pro Art, **nicht pro Ort** (individuell gedruckte QR-Codes lohnen sich finanziell nicht): `flyer`, `plakat`, `sticker`, `whatsapp`, `instagram`, `tiktok`. Pflicht für die Auswertung ist die Unterscheidung **Scan gegen Messenger**; sie steckt in `utm_medium`.
- **Ausnahme Feste:** Pro Fest genau ein Kanal. **Link (Slug) kurz, nur das Fest** (`/q/kattafest`, `/q/winterfest`, `/q/halloween`, `/q/maschinenbau`), **Quelle (`utm_source`) mit Wohnheim-Kürzel** (`kattafest-str1`, `winterfest-str3`, `halloween-str1`; `maschinenbau` ohne, weil kein Wohnheimfest). So bleiben die Zahlen in Matomo/Shop durchgehend, und man sieht das Wohnheim. Bis 04.11.2026 hießen auch die Links `…-str1`/`…-str3`; der schon gedruckte Code `halloween-str1` steht als `alteSlugs` im Kanal und leitet per 302 weiter (jede Seite). **Gedruckte Slugs nie einfach umbenennen**, sondern in `alteSlugs` aufnehmen. Das Fest steht in `utm_source`, Medium immer `scan`: Am Fest gibt es nur QR-Codes, und alles Gedruckte dort (Aufsteller, Flyer, Leinwand) nutzt denselben Code. Kein `utm_content`, keine Unterkanäle pro Weg und kein WhatsApp-Link pro Fest (bewusst so entschieden, gefragt ist nur die Zahl pro Fest). Allgemeine Festival-Flyer, die dort verteilt werden, zählen weiter als `flyer`. Neues Fest = ein Eintrag in `kanaele.ts` nach demselben Muster (Slug = Festname, Quelle = `<fest>-str<nr>`).

### Analytics-Einbindung

- **Umami, selbst gehostet.** Skript wird über die zentrale Config eingebunden: Host und Website-ID als Umgebungsvariablen `PUBLIC_UMAMI_HOST` und `PUBLIC_UMAMI_WEBSITE_ID` (aktuell Platzhalter). **Fehlen die Werte, wird das Skript nicht eingebunden** und die Seite funktioniert trotzdem.
- Der Ticketbutton löst ein **Umami-Klick-Event** (`ticket-click`) aus, per `data-umami-event`-Attribut ohne eigenes JavaScript. Die Position (`header`/`hero`/`footer`) geht als `data-umami-event-position` mit.
- Ein **optionales Skript hängt die UTM-Parameter** des aktuellen Besuchs an den Ticketlink. Schalter `ticket.utmWeitergeben` in `web/src/config.ts`, **standardmäßig AUS** (noch ungeklärt, ob der Ticketshop UTMs auswertet). Bei AUS wird das Skript nicht ausgeliefert.
- **Keine Cookies, kein localStorage, kein Google Analytics.** Die Seite kommt ohne Cookie-Banner aus. Deshalb auch: keine eingebetteten Karten, Videos, Schriften oder Widgets von Drittanbietern, ohne vorher den Datenschutz zu klären. **Einzige gewollte Ausnahme:** der Instagram-Feed (siehe "Instagram-Feed mit Cookie-Banner"), und nur, wenn er in der Config eingetragen ist.

### Analytics-Server (Phase 2, umgesetzt)

- `docker-compose.yml` mit Umami (offizielles Postgres-Image von Umami) und Postgres in benanntem Volume.
- Caddy als Reverse Proxy mit automatischem HTTPS: Hauptdomain liefert die statischen Dateien der Astro-Seite, `stats.<domain>` reicht an Umami weiter.
- Alle Secrets über `.env`, dazu `.env.example` mit Erklärungen.
- `backup.sh`: nächtlicher `pg_dump`, komprimiert, letzte 14 Stände behalten, plus Cron-Beispiel.
- Kurze Anleitung zum lokalen Test mit Docker.

### Deployment (Phase 3, umgesetzt)

- Zielsystem: einzelne Linux-VM von Selfnet e.V. (noch nicht vorhanden, wird angefragt). Root-Zugriff und Docker vorausgesetzt.
- Ablauf: Astro **lokal** bauen, Ausgabeordner per `rsync` auf die VM kopieren, Container hochfahren. **Node läuft nicht auf dem Server.**
- **Kein Terraform.** Alles hostunabhängig, damit ein Wechsel zu einem anderen Anbieter (z. B. Hetzner) ohne Umbau möglich ist.
- Schritte nach dem ersten Start dokumentieren: Umami-Admin-Passwort sofort ändern, Website anlegen, Website-ID in die Web-Config eintragen.

## Entscheidungen aus Phase 1 (nicht im Auftrag festgelegt, jederzeit änderbar)

- **Domain** kommt aus der Umgebungsvariable `SITE_URL` (`web/.env`). Ohne sie gilt die Platzhalter-Domain `https://todo-domain.invalid`; der Build warnt dann, und `docs/kanaele.md` trägt einen Warnhinweis. QR-Codes erst drucken, wenn `SITE_URL` echt gesetzt und neu gebaut ist.
- **QR-Codes liegen in `docs/qr/`** und werden committet, damit das Team sie ohne Node-Setup aus dem Repo holen kann und die Links in `docs/kanaele.md` funktionieren.
- `utm_content` ist **optional** (nur dort gesetzt, wo ein Kanal Varianten hat).
- Erlaubt in UTM-Werten sind auch **Ziffern** (a-z, 0-9, Bindestrich).
- `utm_medium`: `scan` (gedruckte QR-Codes: Flyer, Plakat, Sticker), `messenger` (WhatsApp), `social` (Instagram-/TikTok-Bio), `plattform` (Links auf fremden Event-Seiten/Partnern: `rausgegangen`, `studentenpartys-stuttgart`; bei Links, die eingetragen statt gedruckt werden, Slug ausschreiben). Früher `print`, umbenannt, weil das Team in „Scan“ denkt. Slugs bewusst kurz (`flyer` statt `scan-flyer`), damit der QR-Code weniger dicht ist.
- Ticketbutton öffnet den Shop in einem **neuen Tab** (`target="_blank"`), damit die Infoseite offen bleibt.
- Redirects sind in Astro-Static **Meta-Refresh-Seiten** (`<seite>/q/<slug>/index.html`), keine echten HTTP-301. Für QR-Codes ausreichend; die UTM-Parameter bleiben erhalten.
- **TypeScript ist auf 6.x gepinnt**, weil `astro check` mit TypeScript 7 noch nicht läuft. Erst anheben, wenn Astro das unterstützt.

## Entscheidungen aus Phase 2 (nicht im Auftrag festgelegt, jederzeit änderbar)

- **Umami-Version fest gepinnt** auf `ghcr.io/umami-software/umami:3.4.0`. Geprüft: `3.4.0`, `latest` und `postgresql-latest` sind derselbe Stand (Umami 3 unterstützt nur Postgres). Aktualisieren = Tag ändern, vorher Backup.
- Datenbank: `postgres:17-alpine`. Umami läuft mit `DISABLE_TELEMETRY=1`.
- **Caddy hängt nicht von Umami ab** (kein `depends_on`): Die Infoseite bleibt erreichbar, auch wenn Umami ausfällt. Getestet.
- Domain, E-Mail für Let's Encrypt, alle Geheimnisse und ein optionaler Pfad zur Webseite (`SITE_DIR`, Standard `./site`) kommen aus `analytics/.env`. Fehlende Pflichtwerte lassen `docker compose` mit einer Fehlermeldung abbrechen.
- `HTTP_PORT`/`HTTPS_PORT` sind nur für den lokalen Test überschreibbar (Vorlage `analytics/.env.local.example`, Domain `localhost`, Ports 8080/8443). Auf dem Server bleiben 80/443.
- Caddy liefert `/q/<slug>` und `<seite>/q/<slug>` direkt aus (`try_files {path} {path}/index.html`, gilt für beliebig tiefe Pfade), also ohne zusätzliche Weiterleitung auf den Slash. Unbekannte Adressen zeigen `404.html` (Seite `web/src/pages/404.astro`).
- **Caddy schreibt keine Zugriffs-Logs** (Standardverhalten, bewusst so gelassen; für die Datenschutzerklärung relevant). Container-Logs sind auf 3 x 10 MB begrenzt.
- `backup.sh` läuft auf dem Host per `docker compose exec`, schreibt erst in eine `.partial`-Datei, prüft sie und benennt sie dann um. Sicherungen liegen standardmäßig in `analytics/backups/` (nicht im Git). Off-Site-Kopie ist Sache des Teams (in der Anleitung erwähnt).
- **Attribution (getestet mit Umami 3.4.0, simulierte Requests):** Klickt ein Besucher nach Einstieg über `?utm_source=aushang` auf einer Unterseite ohne UTMs auf Tickets, ordnet der Umami-Bericht **Attribution** (Konversion = Event `ticket-click`) den Klick trotzdem dem Kanal zu. Ein direkter Filter auf das Event nach UTM würde ihn verpassen. Für die Auswertung deshalb den Attributionsbericht nutzen.

## Entscheidungen aus Phase 3 (nicht im Auftrag festgelegt, jederzeit änderbar)

- **Ein Skript für alles:** `deploy/deploy.sh` prüft, baut (`npm ci`, `npm run build`), kopiert per rsync und startet den Stack per SSH. Wiederholbar. Option `--skip-build`. Einstellungen in `deploy/deploy.env` (nicht im Git, Vorlage `deploy.env.example`), Adressen der Seite in `web/.env`.
- **Serverlayout flach:** Die Dateien aus `analytics/` liegen direkt in `DEPLOY_PATH` (Standard `/opt/straussi`), die Seite in `DEPLOY_PATH/site/`, Sicherungen in `DEPLOY_PATH/backups/`.
- **Die `.env` auf der VM legt das Skript beim ersten Deploy selbst an** (aus `analytics/.env.example`, `DOMAIN` aus `SITE_URL`, drei frisch erzeugte Geheimnisse, Rechte 600). Später wird sie nie überschrieben. Die Geheimnisse existieren nur auf der VM (Kopie im Passwortmanager empfohlen); die Datenbanksicherungen hängen nicht von ihnen ab.
- **Schutz vor Fehldeploys:** Abbruch, wenn `SITE_URL` fehlt oder ein Platzhalter ist (`*.invalid`, `*.example.org`). Nur Warnung (kein Abbruch) bei fehlender Umami-ID (beim ersten Deploy normal, sie gibt es erst nach dem Start von Umami), abweichendem Umami-Host und Platzhalter-Ticket-URL.
- **rsync-Details, die nicht "vereinfacht" werden dürfen:** Config-Dateien mit `--inplace` (der Caddyfile ist als Einzeldatei eingebunden; ein rsync-Rename würde ihn im Container veralten lassen). Danach `caddy reload`. Die Seite mit `--delete --delay-updates` in den bestehenden Ordner `site/` (der Ordner selbst darf nicht ersetzt werden, er ist in Caddy eingebunden).
- **Compose-Projektname fest** (`name: straussi`), damit Volume-Namen nicht am Ordnernamen hängen. Nicht ändern, sonst wirkt die Datenbank leer.
- **Cron für das Backup richtet das Skript nicht selbst ein**, es warnt nur, solange keiner existiert (Cron-Zeile in `deploy/README.md`).
- Die Erreichbarkeitsprüfung am Ende ist nicht fatal (DNS und Zertifikat brauchen beim ersten Mal Zeit).
- Jeder Build mit echter Domain erzeugt `docs/kanaele.md` und `docs/qr/` neu; diese Änderungen sind zu committen.
- **Die Domain darf sich beim Anbieterwechsel nicht ändern** (gedruckte QR-Codes). Der Wechsel wurde lokal getestet: frische VM, neuer Deploy, Backup einspielen; Passwort, Website und Website-ID kommen zurück.

## Entscheidungen aus der Gestaltungsrunde (jederzeit änderbar)

- **Dunkles Thema.** Farben stehen als Variablen oben in `web/src/styles/global.css` (`--farbe-hintergrund`, `--farbe-akzent` usw.). Eine andere Akzentfarbe ist eine einzige Zeile. Es gibt kein helles Thema; die Seite meldet sich per `color-scheme: dark` als dunkel an.
- **Keine externen Schriften, Bilder oder Effekte.** Vorbild war nur die Anmutung (dunkler Grund, abgerundete Flächen, ein Akzentton). Weiterhin Systemschriften, damit nichts von fremden Servern nachgeladen wird (Datenschutz, Ladezeit).
- **Instagram-/TikTok-Abschnitt auf der Startseite** ("Bleib auf dem Laufenden", Vorbild Ricola): Überschrift, ein Satz, je ein Link-Knopf zu Instagram und TikTok, darunter Kacheln. Mobil zum Wischen, ab Tablet nebeneinander. Echte Profile: `@straussifestival` auf beiden Plattformen (`instagram` und `tiktok` in `web/src/config.ts`).
- ~~Es wird nichts von Instagram oder TikTok eingebunden.~~ **Überholt** auf Wunsch des Auftraggebers, siehe "Instagram-Feed mit Cookie-Banner". Die Kachel-Fotos (eigene Dateien aus `web/public/insta/`) bleiben als Anzeige ohne Zustimmung.
- Solange `instagram.profilUrl` in `web/src/config.ts` noch `TODO` enthält, warnen der Build und `deploy.sh` (aktuell erledigt, das Profil ist echt eingetragen). Ohne eingetragene Fotos werden die Kacheln **gar nicht angezeigt** (Wunsch des Auftraggebers: keine Platzhalter live); es bleibt das gelbe Farbfeld mit Überschrift und den Knöpfen zu Instagram und TikTok. Ab dem ersten Foto erscheint das Raster wieder (bei weniger als 5 Fotos mit Platzhaltern).
- **Fußzeile nach Vorbild von Ricola:** ein abgerundetes Panel mit vier Spalten (Folge uns mit Instagram- und TikTok-Knopf, Festival mit den Menülinks, Tickets mit Button, Kontakt) und darunter einer schmalen Leiste: links Festivalname und Veranstalter, rechts Impressum, Datenschutz und "© Straussi Festival 2027". Mobil stehen die Spalten untereinander. Menülinks und Rechtslinks kommen aus den Listen im Layout (`hauptmenue`, `fussmenue`).
- **Der Ticketbutton kommt jetzt dreimal vor** (Kopfzeile, Startseiten-Kopf, Fußzeile). Das Klick-Event `ticket-click` ist dasselbe; die Stelle steht als `position` (`header`, `hero`, `footer`) im Event und lässt sich in Umami unterscheiden.
- **Die Copyright-Zeile nennt bewusst keinen Rechteinhaber und kein Jahr.** Inzwischen steht Straussi 1 e.V. im Impressum; ob die Zeile den Verein nennen soll, ist noch nicht entschieden.
- `festival.name` wird in `config.ts` aus `kurzname` und `jahr` zusammengesetzt, damit die Jahreszahl im Kopf farblich abgesetzt werden kann und nur an einer Stelle steht.
- Die Datenschutzseite hat einen zusätzlichen Abschnitt zu den Links zu Instagram und TikTok (mit TODO für die rechtliche Prüfung).

## Entscheidungen aus der Scroll-Neugestaltung (jederzeit änderbar)

- **Fließender Scroll mit sanften Einblend-Animationen**, kein Scroll-Snap/Einrasten (Vorbild: Fusion-Festival-Archivseiten). Abschnitte bekommen die Klasse `.einblenden`; ein `IntersectionObserver` in `index.astro` ergänzt beim Scrollen einmalig `.sichtbar`. **Ausgeblendet wird nur, wenn das Skript läuft** (es setzt selbst `.einblenden-aktiv` am `<html>`); sonst blieb auf manchen Handys alles zwischen Kopf- und Fußzeile leer. Nicht wieder auf reines CSS-Ausblenden umstellen. Der ausgeblendete Ausgangszustand steht in `global.css` bewusst nur innerhalb von `@media (prefers-reduced-motion: no-preference)` – wer reduzierte Bewegung eingestellt hat, sieht alle Inhalte sofort.
- **Startbildschirm mit Fotocollage:** drei eigene Partyfotos von den Sommerfesten von Straussi 1 und 2 als Hintergrund (früher Fotos der Innenhöfe, die nicht nach Party aussahen; **keine Sponsoren auf den Fotos**, auf Hochformat 1000 x 1500 zugeschnitten) (`web/public/wohnheime/`, Anleitung in der README dort), dazu ein dunkles Verlauf-Overlay für Lesbarkeit des Textes. Bilder vor dem Einchecken mit Pillow verkleinert/komprimiert (Hochformat max. 1000 x 1500 px, JPEG-Qualität ~70) – die meisten Gäste kommen laut Auftrag mobil per QR-Code.
- **Leichter Parallax-Effekt** auf den drei Fotos beim Scrollen, bewusst per kleinem Vanilla-JS (`scroll`-Listener, `requestAnimationFrame`-gedrosselt) statt `background-attachment: fixed` oder CSS-Scroll-Timelines: Fixed-Backgrounds sind auf iOS Safari unzuverlässig, Scroll-Timelines werden dort noch nicht unterstützt. Bei `prefers-reduced-motion: reduce` bleiben die Fotos stehen.
- **Countdown bis zum Festivalbeginn** (`web/src/components/Countdown.astro`) unterhalb des Startbildschirms. Ziel-Zeitpunkt ist `festival.startZeitpunkt` in `config.ts`, aktuell `2027-06-11T00:00:00+02:00` – Mitternacht als bewusster, jederzeit anpassbarer Platzhalter, solange keine genauere Startzeit feststeht. Der HTML-Ausgangszustand zeigt Platzhalter-Striche statt einer zur Build-Zeit berechneten Zahl (sonst könnte bei selten neu gebauter Seite kurz eine falsche Zahl aufblitzen); nach Ablauf erscheint ein Text statt negativer Zahlen.
- **Neues, finales Logo** (Strauß am DJ-Pult, rund, transparent; Vorlage `Logo_v01_full_transparent_Straussifestival.png`, auf den Inhalt zugeschnitten und quadratisch gemacht). Zwei Dateien: `web/public/logo.webp` (640 px, groß im Startbildschirm; WebP, weil PNG bei dem Farbverlauf 600 KB wären bzw. als Palette-PNG Farbstufen zeigt) und `web/public/logo-klein.png` (128 px, Palette-PNG, ca. 7 KB: Kopf-, Fußzeile, Favicon, Instagram-Weiterleitung). Keine abgerundeten Ecken mehr per CSS, das Logo ist selbst rund. Austausch: beide Dateien ersetzen.
- **Kopf- und Fußzeile bewusst ohne eingerückte Panel-Optik:** Anders als früher nehmen `.site-header` und `.site-footer` die volle Bildschirmbreite ein und stoßen an die Ober- bzw. Unterkante (Hintergrundfarbe und Trennlinie liegen auf dem äußeren Element, nur der Inhalt bleibt über `--breite-gross` zentriert). Der Insta-Abschnitt bleibt ein eigenständiges Farbfeld (siehe eigener Punkt weiter unten), der Countdown-Kasten wurde dagegen inzwischen entfernt (ebenfalls eigener Punkt).
- **Der Kasten hinter dem Countdown wurde entfernt.** `.countdown-panel` hat keinen Rahmen/Hintergrund/keine Rundung mehr, Überschrift und Zahlen-Kacheln stehen direkt auf dem Seitenhintergrund wie der übrige Seiteninhalt.
- **Countdown-Kacheln im Look der Fusion-Festival-Archivseite** (zweifarbige Kachel: große Zahl oben auf Akzentfläche, Label unten auf dunkler Fläche in Versalien), aber mit unseren Farben (`--farbe-akzent`/`--farbe-akzent-dunkel`) und der Systemschrift statt der Schrift/Bildsprache des Vorbilds.
- **Die schwebende Astro-Werkzeugleiste ist abgeschaltet** (`devToolbar: { enabled: false }` in `astro.config.ts`): für ein nicht-technisches Team nur verwirrend, ohne Nutzen für Besucher.
- **Line-up hat eine eigene Seite** (`web/src/pages/lineup.astro`, Navigationspunkt zwischen Infos und FAQ). Der Abschnitt "Programm und Line-up" auf der Startseite verlinkt nur noch kurz dorthin, statt die TODO-Hinweise doppelt zu pflegen.
- **Pink (Akzent B, `--farbe-akzent-zwei`) ist die Highlight-Farbe**, Gold (Akzent A) bleibt die Aktionsfarbe für Buttons und den Fokusring – bewusst getrennte Rollen. Pink färbt jetzt Links (`a`), hervorgehobenen Text (`.prose strong`) und Hover-/Aktiv-Zustände im Menü und in der Fußzeile. Auf den helleren Flächen-Panels (Kopf-/Fußzeile, Kacheln) bleibt es bei Gold, weil Pink dort laut Kontrastrechnung (WCAG-Formel) zu wenig Kontrast hätte – siehe Kommentare in `global.css` bei den Variablen.
- **Bug behoben: Ticketbutton in der Fußzeile war bei Hover unlesbar** (Text und Fläche exakt dieselbe Goldfarbe). Ursache war eine CSS-Spezifitätskollision: `.footer-spalte a:hover` war spezifischer als `.footer-spalte .button` und überschrieb dessen Textfarbe. Behoben mit einer eigenen, noch spezifischeren Regel `.footer-spalte .button:hover`. Zusätzlich nutzt der Hover-Effekt aller Buttons jetzt Schatten/Anheben statt `filter: brightness()` – Farben ändern sich beim Hover dadurch gar nicht mehr, das Kontrastproblem kann so nicht wieder auftreten.
- **Insta-Abschnitt jetzt exakt nach dem Vorbild von ricola.com/de-de** (Abschnitt "Stay in the Loop", per Playwright und CSS-Inspektion der Live-Seite nachgebaut), aber mit unserer Aktionsfarbe (Gold) statt Ricola-Gelb, unseren Systemschriften statt der Ricola-Schrift und eigenem, zu uns passendem Text. Nicht mehr das vorherige Scroll-Karussell mit Pfeil-Buttons – das war eine Zwischenlösung, bevor das Ricola-Vorbild konkret vorlag.
  - Ein vollflächiges, abgerundetes Farbfeld (`.insta-panel`, Gold) enthält nur Überschrift, Text und zwei reine Icon-Knöpfe (Instagram, TikTok; der Profilname steht im `aria-label`, sichtbar ist nur das Icon).
  - Die Foto-Kacheln (`.insta-kacheln`) stehen bewusst **außerhalb** von `.insta-panel` als eigenes Raster (3 Spalten mobil, 5 ab Tablet) mit Zickzack-Versatz (gerade/ungerade Kachel höher/tiefer) und ziehen sich per negativem oberen Rand über den unteren Rand des Farbfelds – dadurch ragen die hohen Kacheln unten sichtbar darüber hinaus. Läge das Raster innerhalb von `.insta-panel`, würde der negative Rand stattdessen in die Überschrift hineinziehen (genau das ist beim ersten Versuch passiert und wurde korrigiert).
  - `.insta-panel` ist zusätzlich schmaler als `.insta-kacheln` (fester Abzug von der Breite, größer ab der Tablet-Breite), damit die äußerste linke und rechte Kachel auch seitlich über den Rand des Farbfelds hinausragen – ebenfalls nach dem Ricola-Vorbild, das links und rechts denselben Überstand zeigt wie unten.
  - Mobil/Tablet blendet eine Regel die erste und letzte Kachel aus, damit bei fünf Kacheln genau eine volle Dreierreihe übrig bleibt statt einer angeschnittenen zweiten Reihe (dieselbe Technik wie bei Ricola).
  - **Leichte "Nachzieh"-Animation:** ein kleines Vanilla-JS in `InstaAbschnitt.astro` setzt beim Scrollen die CSS-Variable `--insta-fortschritt` (0 bis 1, wie weit der Abschnitt durchs Bild gescrollt ist); gerade und ungerade Kacheln lesen sie mit unterschiedlichem Faktor aus (`-6%`/`-12%`), wodurch sie unterschiedlich schnell wandern. Nur innerhalb von `prefers-reduced-motion: no-preference` – sonst bleiben die Kacheln unbeweglich.

## Farbpalette des Festivals (jederzeit änderbar)

- Die Seite nutzt die **vom Team gelieferte Palette** (je 8 Stufen Pink, Grau, Gelb; jeweils 4 Helligkeitsstufen mit je einer kräftigen und einer gedämpften Variante). Thema bleibt **dunkel**.
- Rollen wie bisher: **Gelb `#F3E007` = Aktionsfarbe** (Buttons, Countdown, Insta-Farbfeld, Fokusring; Text darauf `#2A2700`), **Pink `#EE0CE3` = Highlight** (Links, hervorgehobener Text). Auf den Flächen von Kopf- und Fußzeile reicht das kräftige Pink nicht (3,8:1), dort für Hover/Aktiv die hellere Stufe `#F97BF3` (`--farbe-akzent-zwei-hell`). Grau: `#ABABAF` leiser Text, `#676A79` Kacheln/Symbolknöpfe.
- Die Palette hat **keinen dunklen Ton**. Hintergrund `#1B1C20`, Flächen `#2C2D33` und Linie `#41434B` sind eigene, leicht bläuliche Stufen passend zum Palettengrau. Ältere Abschnitte, die von "Gold" oder dem türkisen Akzent sprechen, meinen jetzt Gelb.
- Das neue Logo nutzt Gelb und Pink passend zur Palette.

## Instagram-Feed mit Cookie-Banner (jederzeit änderbar)

- **Auf Wunsch des Auftraggebers ein echter Instagram-Feed** an der Stelle der Kacheln, über ein **kostenloses Widget eines Drittanbieters** per iframe. **Entschieden: LightWidget** (laut Anbieter ohne Aufruflimit; SnapWidget wäre die Alternative); Elfsight ungeeignet (Gratis-Tarif nur 200 Aufrufe/Monat). Einstellungen in `instagram.widget` in `web/src/config.ts` (`url`, `anbieter`, `hoehe`), anbieterneutral.
- **Ohne eingetragene `url` ändert sich nichts:** kein Banner, kein localStorage, Datenschutzseite mit dem alten Text. Banner, Fußzeilen-Link „Cookie-Einstellungen“ und die Datenschutz-Abschnitte erscheinen automatisch, sobald `url` gesetzt ist.
- **Eigener, schlichter Banner** (`web/src/components/CookieBanner.astro`), kein externes Consent-Tool. „Ablehnen“ ist gleich groß wie „Akzeptieren“. Das iframe wird erst nach „Akzeptieren“ per Skript erzeugt (`InstaAbschnitt.astro`); vorher und ohne JavaScript bleiben die Kacheln mit Hinweis und Knopf stehen. Widerruf entfernt das iframe wieder.
- Die Antwort steht im **localStorage** (`straussi-einwilligung-instagram`, Logik in `web/src/scripts/einwilligung.ts`), nicht in einem Cookie. Umami bleibt cookielos und braucht keine Zustimmung.
- Die Datenschutzseite bekommt mit Widget einen Abschnitt `#instagram-feed` (mit TODO für Anbieterdaten, USA-Übermittlung und rechtliche Prüfung).

## Instagram-Weiterleitung per QR-Code (jederzeit änderbar)

- **Seite `web/src/pages/redirect-instagram.astro`** zählt den Aufruf in Umami und leitet dann auf `instagram.profilUrl` weiter. Weil sie eine normale Seite ist, gilt automatisch `/redirect-instagram/q/<slug>` für jeden Kanal, und die QR-Codes entstehen in `docs/qr/redirect-instagram/<slug>.svg`. Kein eigener Kanal, keine eigene Config.
- Ablauf: `/redirect-instagram/q/flyer` -> (Meta-Refresh) `/redirect-instagram/?utm_...` -> Umami-Seitenaufruf mit UTMs -> `location.replace` zu Instagram. Das Umami-Skript läuft dort mit `data-auto-track="false"`; die Seite sendet selbst den Seitenaufruf und das Ereignis `insta-weiterleitung` (`analytics.instaEvent` in `config.ts`) und leitet erst danach weiter (höchstens 1,5 s Wartezeit, ohne Umami/bei Blocker sofort, ohne JavaScript per Meta-Refresh nach 3 s, dann ungezählt).
- Auswertung in Umami: Ereignis `insta-weiterleitung` (gewünscht: klar getrennt von den Webseiten-Besuchen) oder Seite `/redirect-instagram/`, nach UTM-Quelle aufgeschlüsselt. Die Insta-Scans zählen trotzdem als Besucher der Seite; für reine Webseiten-Zahlen `/redirect-instagram/` herausfiltern. Unten steht ein Knopf „Zu Instagram“ für den Fall, dass die automatische Weiterleitung nicht greift (iOS öffnet die Instagram-App oft nur bei angetipptem Link; auf echten Handys noch zu testen). Bewusst ohne das gemeinsame Layout (keine Kopf-/Fußzeile, kein Banner) und mit `noindex`. Nicht im Menü.

## Umstieg auf Cloud86-Webhosting und Matomo (gilt vor allen älteren Abschnitten zu Umami, Docker und Deploy)

- **Hosting:** Webhosting „Medium“ bei **Cloud86 B.V.** (Plesk, LiteSpeed/Apache, PHP/MySQL, Rechenzentren NL). Dort läuft auch die Nextcloud unter `cloud.straussifestival.de` (nicht anfassen). **Kein Docker, kein Root** – deshalb kein Umami. Die Seite wird lokal gebaut und per Plesk-Dateimanager (ZIP) nach `httpdocs` hochgeladen. Anleitung: `deploy/PLESK.md`. AVV gilt laut Cloud86-Datenschutzerklärung automatisch mit der Nutzung (DPA-PDF ablegen).
- **Statistik: Matomo** (selbst installiert unter `stats.straussifestival.de`, gleiches Webhosting) statt Umami. Umgebungsvariablen `PUBLIC_MATOMO_URL`, `PUBLIC_MATOMO_SITE_ID`. Einbindung in `web/src/components/Analytics.astro`.
- **Cookies: hybrid.** Matomo zählt standardmäßig **ohne Cookies** (`requireCookieConsent`); nach „Akzeptieren“ im Cookie-Banner `setCookieConsentGiven` (Wiedererkennung über Tage, Cookies `_pk_id`/`_pk_ses`), bei „Ablehnen“/Widerruf `forgetCookieConsentGiven`. Deshalb erscheint der **Cookie-Banner jetzt immer**, sobald Matomo aktiv ist (`bannerAktiv` in `config.ts`). Eine Antwort gilt für Statistik-Cookies und den Instagram-Feed. localStorage-Schlüssel `straussi-einwilligung`.
- **Ereignisse:** Ticketklick = Kategorie `Ticket`, Aktion `Klick`, Name = `header`/`hero`/`footer` (Klick-Listener in `Analytics.astro` auf `[data-ticket-link]`, `data-position`). Instagram-Weiterleitung = Kategorie `Instagram`, Aktion `Weiterleitung` (mit Callback, dann `location.replace`). `enableLinkTracking` zählt zusätzlich ausgehende Links (Instagram, TikTok, Ticketshop).
- **Kanäle in Matomo:** UTM-Parameter werden gelesen; für `utm_source`/`utm_medium`/`utm_content` einzeln braucht es das kostenlose Plugin **Marketing Campaigns Reporting**. Ticketklicks pro Kanal über das Ziel **Ticketklick** (Ereignis, Kategorie `Ticket`). Ohne Cookie-Zustimmung ordnet Matomo Klicks nur innerhalb desselben Besuchs einem Kanal zu.
- **Datenschutzerklärung** entsprechend: Cloud86 als Hoster mit AVV, **Server-Logfiles höchstens 2 Monate** (Protokollrotation in Plesk monatlich – täglich ist bei Cloud86 gesperrt –, max. 1 alte Datei; muss so eingestellt bleiben), Matomo mit IP-Kürzung um 2 Bytes (muss in Matomo so eingestellt sein), Cookie-Abschnitt `#cookies`.
- `web/public/.htaccess`: HTTPS erzwingen, `www` -> ohne `www`, `ErrorDocument 404 /404.html`, Cache für `/_astro/`.
- **Kanal-Weiterleitungen sind auf Cloud86 echte HTTP-302** statt Meta-Refresh (die zeigte kurz eine weiße Seite): `kanaele-output.ts` hängt beim Build für jede Seite × Kanal eine `RewriteRule` an `dist/.htaccess` an (Quelle: `kanalRedirects`). 302 statt 301, damit Browser sie nicht dauerhaft merken. Die Meta-Refresh-Seiten von Astro bleiben als Rückfall in `dist/`. Mit Apache 2.4 lokal getestet (302, mit/ohne Schrägstrich, 404, www, Cache).
- **Fremde Quellen umschreiben:** Instagram hängt an den Bio-Link selbst `utm_source=ig&utm_medium=social&utm_content=link_in_bio` an (in Matomo beobachtet). `fremdeQuellen` in `kanaele.ts` ordnet solche Werte einem eigenen Kanal zu (`ig` -> `instagram`); `kanaele-output.ts` erzeugt daraus eine 302-Regel in `dist/.htaccess`, die jede Seite mit `utm_source=ig` auf dieselbe Seite mit den Werten des Kanals umleitet (andere Parameter wie `fbclid` fallen weg). Mit Apache 2.4 lokal getestet. TikTok hängt laut Recherche an Bio-Links nichts an (nur an bezahlte Anzeigen), deshalb kein Eintrag. In die Bios trotzdem immer `/q/instagram` bzw. `/q/tiktok` eintragen.
- `analytics/` und `deploy/deploy.sh` bleiben als Alternative für einen eigenen Server liegen, sind aber **nicht in Verwendung** und passen nicht mehr zur Matomo-Einbindung der Seite.

## Inhaltsrunde Oktober 2026 (jederzeit änderbar)

- **Schreibweise überall „Straussi“ (mit ss)**, nie „Straußi“ (Wunsch des Auftraggebers). Der Wohnheimname **Straußäcker** bleibt mit ß.
- **Kein Zutritt unter 18**, auch nicht in Begleitung; muss klar so dastehen (Infos, FAQ, ABC).
- **Keine Einlasszeiten** auf der Seite (bewusst entfernt). Verbotsliste: „Waffen jeglicher Art“, dazu (als Witz gewünscht) **Sperrgut**.
- **Festival-ABC mit Buchstabenleiste** (`web/src/components/FestivalAbc.astro`): Die `<dt>`/`<dd>`-Paare bleiben normales HTML in `faq.astro`; die Komponente setzt beim Bauen Sprungziele `abc-<buchstabe>` an das erste Stichwort je Buchstabe und baut die Leiste (Buchstaben ohne Eintrag ausgegraut). Leiste klebt beim Scrollen oben (`position: sticky`), mobil eine wischbare Zeile, ab 48rem alle 26 in einer Zeile.
- **Seite für Bewohner*innen** (`web/src/pages/bewohner.astro`), im Menü als „bald“ markiert, Inhalt noch TODO.
- **`docs/STYLE.md`** für Mitwirkende (interaktive Geländekarte): Farben/Rollen, Schrift, Abstände, Bausteine, Barrierefreiheit und vor allem **keine Fremd-Karten (Google Maps, OSM-Kacheln, CDN)**, Empfehlung eigene SVG-Karte.

## UTM-Weitergabe an den Ticketshop (dauerhaft an)

- **Ticketshop:** `https://straussifestival.dein-ticket.shop/events/straussifestival-111/straussifestival-111` (`ticket.url`). Vorverkauf läuft seit 20.10.2026. **Preise bewusst nicht auf der Seite**, Early-Bird gestrichen.
- **`ticket.utmWeitergeben: true`** (dauerhaft, Wunsch des Auftraggebers). `UtmWeitergabe.astro` hängt den Werbeweg an alle `a[data-ticket-link]`: **ohne Zustimmung** nur die UTMs der aktuellen Adresse (nichts gespeichert), **mit Zustimmung** im Cookie-Banner zusätzlich für den Besuch im **sessionStorage** (`straussi-werbeweg`, gelöscht beim Schließen des Tabs oder Widerruf). Grund: Speichern im Browser braucht nach § 25 TDDDG eine Einwilligung. Banner-Text, `bannerAktiv` und Datenschutzerklärung (Abschnitt Ticketshop) entsprechend. Im Browser getestet (ohne/mit Zustimmung, Widerruf, neuer Tab).
- **Infos für den Shop-Betreiber:** `docs/TICKETSHOP-UTM.md` (bei neuen Kanälen die Tabelle dort ergänzen).

## Ticket-Weiterleitung (redirect-ticket)

- **`web/src/pages/redirect-ticket.astro`**: wie `redirect-instagram`, aber Ziel ist der Ticketshop. Gedacht für Links auf fremden Seiten, die direkt zum Kauf führen: `/redirect-ticket/q/rausgegangen`, `/redirect-ticket/q/studentenpartys-stuttgart` (gilt automatisch für jeden Kanal). Zählt Seitenaufruf + Ereignis **Kategorie `Ticket`, Aktion `Weiterleitung`** (`analytics.ticketWeiterleitungAktion`) und hängt die UTMs der eigenen Adresse an den Shop-Link (nichts gespeichert), dann `location.replace`. Fallback ohne JS: Meta-Refresh nach 3 s ohne UTMs. Datenschutzerklärung hat einen Abschnitt dazu. Im Browser getestet.

## Ticket-Wörter im Text als Links

- Jedes Wort mit „Ticket“ im Fließtext (Tickets, Ticketshop, Ticketpartner, Tagestickets, Wochenendtickets, Ticketarten, „Tickets kaufen“) ist ein Link zum Shop über **`<TicketLink>`** (`web/src/components/TicketLink.astro`), auf Startseite, Infos, FAQ/ABC und in der Fußzeile. **Nicht** verlinkt: Überschriften, Seitenbeschreibungen und die Datenschutzerklärung.
- `TicketLink` trägt `data-ticket-link` und `data-position="text"`: zählt in Matomo als Ereignis „Ticket / Klick / text“ und bekommt die UTMs wie die Buttons. Ohne echte Ticket-URL normaler Text. Neue Textstellen mit „Ticket“ ebenfalls so verlinken.

## Englische Version (komplett, inkl. Rechtliches)

- **Englische Seiten liegen in `web/src/pages/en/`** mit denselben Dateinamen wie die deutschen (`/en/`, `/en/infos/`, `/en/faq/` …). Alle Seiten sind übersetzt, auch Impressum und Datenschutz; dort steht oben, dass die **deutsche Fassung rechtlich maßgeblich** ist. Übersetzung durch Claude, **noch gegenlesen lassen**.
- **Texte der gemeinsamen Bausteine** (Menü, Fußzeile, Ticketbutton, Banner, Countdown, Insta-Abschnitt, ABC-Leiste) stehen zweisprachig in **`web/src/i18n.ts`** (`TEXTE.de` / `TEXTE.en`). Die Sprache ergibt sich aus der Adresse (`spracheVon(Astro.url)`: `/en/…` = Englisch). Interne Menülinks über `lokal()`.
- **Startseite** ist jetzt ein gemeinsamer Baustein **`web/src/components/Startseite.astro`** (Startbild, Countdown, Insta-Abschnitt, Skripte für Einblenden/Parallax); `pages/index.astro` und `pages/en/index.astro` enthalten nur noch ihren Text.
- **Sprachumschalter** DE/EN als letzter Punkt im Hauptmenü (Kopfzeile), führt zur selben Seite in der anderen Sprache; dazu `hreflang`-Links im Kopf. Auf der 404-Seite (einmal, zweisprachig) kein Umschalter.
- **Pflege:** Jede inhaltliche Änderung an einer Seite **in beiden Sprachen** machen. Neue Seite = deutsche und englische Datei, sonst führt der Umschalter ins Leere.
- Kanal-Weiterleitungen (`/q/…`) und QR-Codes gibt es nur für die deutschen Seiten (`seiten.ts` liest nur die oberste Ebene von `src/pages/`); gedruckte Codes führen auf Deutsch, Besucher wechseln per Umschalter.
- Die Fotos im Startbild haben nur deutsche Alt-Texte (`startBilder` in `config.ts`).

## FAQ aufklappbar, Kontakt in der Fußzeile

- FAQ-Fragen sind `<details class="faq-frage">` mit `<summary>` (ohne JavaScript), Plus/Minus in Gelb; das Festival-ABC bleibt offen.
- Fußzeile, Spalte Kontakt: `info@`, darunter **Acts** (`acts@straussifestival.de`) und **Sponsoring** (`sponsorings@straussifestival.de`, so vom Auftraggeber angegeben, „mit s hinten“). Adressen zentral in `festival.email`, `festival.emailActs`, `festival.emailSponsoring` (`config.ts`).

## Karte und Kalender-Knopf (November 2026, jederzeit änderbar)

- **Karte auf der Anfahrt-Seite** (`web/src/components/Karte.astro`): eigenes Bild `web/public/anfahrt/karte.webp` (OpenStreetMap-Ausschnitt mit pinker Markierung, erzeugt mit `web/werkzeug/karte.py`, liegt bewusst nicht in `public/`), darunter Knöpfe „Google Maps“, „Apple Karten“, „OpenStreetMap“ (nur Links, öffnen die Adresse in der Karten-App). **Keine eingebettete Karte** (vom Auftraggeber so gewählt: keine Zustimmung nötig). Quellenangabe „© OpenStreetMap-Mitwirkende“ ist Lizenzpflicht. Adresse in `festival.adresse`, Koordinaten in `karte` (`config.ts`).
- **Knopf „In den Kalender eintragen“** (`web/src/components/KalenderButton.astro`) unter dem Countdown auf der Startseite und auf der Anfahrt-Seite. Aufklappbar ohne JavaScript (`<details>`): Google-Kalender-Link und `/kalender.ics` (Endpunkt `web/src/pages/kalender.ics.ts`, für Apple, Outlook, Android). **Ganztägig** 11.–12.06.2027 (`kalender` in `config.ts`), solange es keine Uhrzeiten gibt. Matomo-Ereignis Kategorie `Kalender`, Aktion `Eintrag`, Name `google`/`ics`.
- Datenschutzerklärung (DE/EN) hat einen Abschnitt „Karte und Kalendereintrag“.
- Die Anfahrt-Seite steht im Menü weiter auf „bald“ (Fahrrad-Abschnitt noch TODO).

## Befehle (im Ordner `web/`)

```
npm install          Abhängigkeiten installieren
npm run dev          lokaler Entwicklungsserver
npm run build        Prüfen (astro check) und bauen nach web/dist/; erzeugt auch docs/qr/ und docs/kanaele.md
npm run preview      gebaute Seite lokal ansehen
```

Deployment: siehe `deploy/PLESK.md` (bauen, ZIP aus `web/dist/`, in Plesk nach `httpdocs` hochladen und entpacken).

## Hinweise für Inhalte (Astro-Seiten)

- Jede Seite liegt in `web/src/pages/<name>.astro`. Der Dateiname ist die Adresse (`infos.astro` -> `/infos/`, `index.astro` ist die Startseite). Der Text steht direkt in der Datei als HTML zwischen `<div class="wrap prose">` und `</div>`: `<h2>` für Zwischenüberschriften, `<p>` für Absätze, `<ul><li>` für Listen.
- Der Kopf der Datei (zwischen den `---`) und die Zeile `<Base title="..." description="...">` legen Titel und Beschreibung fest.
- Geschweifte Klammern `{` und `}` sind in Astro-Texten Sonderzeichen. Im Text vermeiden oder als `{'{'}` schreiben.
- **Neue Seite:** eine Datei in `web/src/pages/` anlegen (am einfachsten `infos.astro` kopieren) und **eine Zeile in der Navigationsliste** in `web/src/layouts/Base.astro` ergänzen (`hauptmenue` oder `fussmenue`). Ohne diese Zeile gibt es die Seite, aber keinen Link darauf.
- **Seite noch nicht fertig:** Im Menü (`hauptmenue` in `Base.astro`) `bald: true` setzen. Der Punkt erscheint dann ausgegraut mit „bald“ und ist kein Link (Kopf- und Fußzeile). Aktuell so: Line-up und Anfahrt. Die Seiten selbst bleiben unter ihrer Adresse erreichbar; Links im Fließtext auf sie wurden entfernt (Kommentare an den Stellen in `index.astro` und `faq.astro` zeigen, was wieder rein muss).
- Zwischenüberschriften bekommen keine automatischen Anker-`id`s mehr (waren bei Markdown automatisch da, wurden nirgends verwendet).

## Offene Punkte

Siehe `docs/SPEC.md`. Nichts davon erfinden, immer als TODO stehen lassen.
