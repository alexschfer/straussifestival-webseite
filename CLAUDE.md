# Straußi Festival 2027: Webseite und Web-Analytics

## Kontext

Das Straußi Festival 2027 ist ein Festival der Studierendenwohnheime Straußäcker in Stuttgart, veranstaltet vom Wohnheimsreferat Straußäcker 3, mit rund 7500 erwarteten Gästen.

Die Webseite ist eine **Infoseite**, die auf einen externen Ticketshop (dein-ticket.shop) verlinkt. Wichtigstes Ziel neben der Information: nachvollziehen, **über welchen Kanal** (Flyer, Aushänge, QR-Codes, Social Media) die Besucher kommen und **wie viele davon auf den Ticketbutton klicken**. Die meisten Besucher kommen per QR-Code vom Handy.

Das Team ist ehrenamtlich und teils nicht technisch. **Alles einfach und wartbar halten.**

## Grundregeln

- **Keine erfundenen Inhalte, Preise, Line-ups oder Daten.** Fehlendes als klar erkennbaren Platzhalter `TODO` setzen.
- **Keine Secrets im Repo.** Konfiguration über `.env`, im Repo nur `.env.example`.
- Arbeit in Phasen, **nach jeder Phase committen**. Bei fehlenden Entscheidungen nachfragen statt raten.
- Sprache von Seitentexten, Doku und Kommentaren: Deutsch.
- Sprechende Namen und Kommentare im Stil der vorhandenen Dateien beibehalten (deutsche Bezeichner in den Daten und in der Config, z. B. `kanaele`, `vorlaeufig`).

## Repo-Struktur

```
CLAUDE.md        dieser Projektkontext
README.md        Kurzanleitung: lokal starten, bauen, deployen
docs/SPEC.md     Aufgaben und Stand (inkl. offene Punkte)
docs/kanaele.md  Tabelle der Marketingkanäle (GENERIERT, nicht von Hand ändern)
docs/qr/         QR-Codes als SVG pro Kanal (GENERIERT)
web/             Astro-Seite
analytics/       docker-compose.yml, Caddyfile, backup.sh, .env.example, README.md
deploy/          deploy.sh, deploy.env.example, README.md (Anleitung)
```

## Entscheidungen (aus dem Auftrag)

### Web (Phase 1)

- Astro im statischen Modus (`output: 'static'`), TypeScript, **kein SSR, kein UI-Framework**, so wenig JavaScript wie möglich.
- Seiteninhalte als **einfache Astro-Seiten**: Jede Seite ist eine `.astro`-Datei unter `web/src/pages/` mit dem Inhalt direkt darin (HTML), dazu ein gemeinsames Layout `web/src/layouts/Base.astro`. **Keine Content Collections, kein Markdown** (auf Wunsch des Auftraggebers bewusst so umgestellt; nicht wieder einführen). Die Navigation ist eine kleine Liste im Layout. Seiten: Startseite (`index.astro`), Infos, FAQ, Anfahrt, Impressum, Datenschutz. Impressum und Datenschutz mit TODO-Platzhaltern, der Verein ist noch nicht gegründet.
- Responsives, schlichtes Layout, mobil zuerst. **Dunkles Thema** mit abgesetzten, abgerundeten Flächen (Kopfzeile, Instagram-Abschnitt, Fußzeile) und einem ruhigen türkisen Akzent; Vorbild war die Gestaltung von tiken.dev, ohne deren Schriften, Bilder oder Effekte zu übernehmen. Weiterhin Systemschriften, kein Framework.
- Ticketbutton prominent, verlinkt auf eine **zentral konfigurierte Ticket-URL** (`web/src/config.ts`, aktuell Platzhalter).

### Kanäle und Tracking (Kern)

- **Eine einzige Datenquelle** für alle Marketingkanäle: `web/src/data/kanaele.ts`. Pro Kanal: Slug, `utm_source`, `utm_medium`, `utm_content` (optional), Beschreibung, Flag `vorlaeufig`.
- Daraus werden beim Build automatisch erzeugt:
  1. Redirects `/q/<slug>` -> `/` mit UTM-Parametern (`redirects`-Option in `astro.config.ts`).
  2. Ein QR-Code als SVG pro Kanal (npm-Paket `qrcode`), der auf `<Domain>/q/<slug>` zeigt, abgelegt in `docs/qr/`.
  3. `docs/kanaele.md`: Tabelle mit Slug, fertigem UTM-Link und QR-Datei.
  (2 und 3 erledigt die Integration `web/integrations/kanaele-output.ts` im Hook `astro:build:done`.)
- `utm_campaign` ist immer `straussi-festival-2027`.
- **Schreibregel für UTM-Werte** (und Slugs): nur Kleinbuchstaben (und Ziffern), keine Umlaute, kein ß, keine Leerzeichen, Wörter mit Bindestrich. Wird **beim Build per Validierung erzwungen** (`validiereKanaele` in `kanaele.ts`; der Build bricht bei Verstoß ab). Doppelte Slugs brechen den Build ebenfalls ab.
- Beispielkanäle sind angelegt und als `vorlaeufig` markiert: flyer, aushang-wohnheim-a, aushang-wohnheim-b, mensa, instagram, whatsapp.

### Analytics-Einbindung

- **Umami, selbst gehostet.** Skript wird über die zentrale Config eingebunden: Host und Website-ID als Umgebungsvariablen `PUBLIC_UMAMI_HOST` und `PUBLIC_UMAMI_WEBSITE_ID` (aktuell Platzhalter). **Fehlen die Werte, wird das Skript nicht eingebunden** und die Seite funktioniert trotzdem.
- Der Ticketbutton löst ein **Umami-Klick-Event** (`ticket-click`) aus, per `data-umami-event`-Attribut ohne eigenes JavaScript. Die Position (`header`/`hero`/`footer`) geht als `data-umami-event-position` mit.
- Ein **optionales Skript hängt die UTM-Parameter** des aktuellen Besuchs an den Ticketlink. Schalter `ticket.utmWeitergeben` in `web/src/config.ts`, **standardmäßig AUS** (noch ungeklärt, ob der Ticketshop UTMs auswertet). Bei AUS wird das Skript nicht ausgeliefert.
- **Keine Cookies, kein localStorage, kein Google Analytics.** Die Seite kommt ohne Cookie-Banner aus. Deshalb auch: keine eingebetteten Karten, Videos, Schriften oder Widgets von Drittanbietern, ohne vorher den Datenschutz zu klären.

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
- Mediums der Beispielkanäle: `print` (Flyer, Aushänge, Mensa), `social` (Instagram), `messenger` (WhatsApp). Vorläufig.
- Ticketbutton öffnet den Shop in einem **neuen Tab** (`target="_blank"`), damit die Infoseite offen bleibt.
- Redirects sind in Astro-Static **Meta-Refresh-Seiten** (`/q/<slug>/index.html`), keine echten HTTP-301. Für QR-Codes ausreichend; die UTM-Parameter bleiben erhalten.
- **TypeScript ist auf 6.x gepinnt**, weil `astro check` mit TypeScript 7 noch nicht läuft. Erst anheben, wenn Astro das unterstützt.

## Entscheidungen aus Phase 2 (nicht im Auftrag festgelegt, jederzeit änderbar)

- **Umami-Version fest gepinnt** auf `ghcr.io/umami-software/umami:3.4.0`. Geprüft: `3.4.0`, `latest` und `postgresql-latest` sind derselbe Stand (Umami 3 unterstützt nur Postgres). Aktualisieren = Tag ändern, vorher Backup.
- Datenbank: `postgres:17-alpine`. Umami läuft mit `DISABLE_TELEMETRY=1`.
- **Caddy hängt nicht von Umami ab** (kein `depends_on`): Die Infoseite bleibt erreichbar, auch wenn Umami ausfällt. Getestet.
- Domain, E-Mail für Let's Encrypt, alle Geheimnisse und ein optionaler Pfad zur Webseite (`SITE_DIR`, Standard `./site`) kommen aus `analytics/.env`. Fehlende Pflichtwerte lassen `docker compose` mit einer Fehlermeldung abbrechen.
- `HTTP_PORT`/`HTTPS_PORT` sind nur für den lokalen Test überschreibbar (Vorlage `analytics/.env.local.example`, Domain `localhost`, Ports 8080/8443). Auf dem Server bleiben 80/443.
- Caddy liefert `/q/<slug>` direkt aus (`try_files {path} {path}/index.html`), also ohne zusätzliche Weiterleitung auf den Slash. Unbekannte Adressen zeigen `404.html` (Seite `web/src/pages/404.astro`).
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
- **Instagram-Abschnitt auf der Startseite** ("Bleib auf dem Laufenden", Vorbild Ricola): Überschrift, ein Satz, ein Link zum Profil, darunter Kacheln. Mobil zum Wischen, ab Tablet nebeneinander.
- **Es wird nichts von Instagram eingebunden**, nur verlinkt. Die Kachel-Fotos sind eigene Dateien aus `web/public/insta/` (Anleitung liegt dort). Grund: Ein eingebetteter Instagram-Feed würde Daten an Meta übertragen und die Seite cookie-bannerpflichtig machen. **Nicht durch ein Feed-Widget ersetzen.**
- Profiladresse und Anzeigename stehen als Platzhalter in `web/src/config.ts` (`instagram`). Solange dort `TODO` steht, warnen der Build und `deploy.sh`. Ohne eingetragene Fotos zeigen die Kacheln "TODO Foto".
- **Fußzeile nach Vorbild von Ricola:** ein abgerundetes Panel mit vier Spalten (Folge uns mit Instagram-Knopf, Festival mit den Menülinks, Tickets mit Button, Kontakt) und darunter einer schmalen Leiste: links Festivalname und Veranstalter, rechts Impressum, Datenschutz und "© Straußi Festival 2027". Mobil stehen die Spalten untereinander. Menülinks und Rechtslinks kommen aus den Listen im Layout (`hauptmenue`, `fussmenue`).
- **Der Ticketbutton kommt jetzt dreimal vor** (Kopfzeile, Startseiten-Kopf, Fußzeile). Das Klick-Event `ticket-click` ist dasselbe; die Stelle steht als `position` (`header`, `hero`, `footer`) im Event und lässt sich in Umami unterscheiden.
- **Die Copyright-Zeile nennt bewusst keinen Rechteinhaber und kein Jahr.** Wer im Impressum verantwortlich ist, steht noch nicht fest (Verein nicht gegründet). Erst danach dort den passenden Rechteinhaber eintragen.
- `festival.name` wird in `config.ts` aus `kurzname` und `jahr` zusammengesetzt, damit die Jahreszahl im Kopf farblich abgesetzt werden kann und nur an einer Stelle steht.
- Die Datenschutzseite hat einen zusätzlichen Abschnitt zum Instagram-Link (mit TODO für die rechtliche Prüfung).

## Entscheidungen aus der Scroll-Neugestaltung (jederzeit änderbar)

- **Fließender Scroll mit sanften Einblend-Animationen**, kein Scroll-Snap/Einrasten (Vorbild: Fusion-Festival-Archivseiten). Abschnitte bekommen die Klasse `.einblenden`; ein `IntersectionObserver` in `index.astro` ergänzt beim Scrollen einmalig `.sichtbar`. Der ausgeblendete Ausgangszustand steht in `global.css` bewusst nur innerhalb von `@media (prefers-reduced-motion: no-preference)` – wer reduzierte Bewegung eingestellt hat, sieht alle Inhalte sofort.
- **Startbildschirm mit Fotocollage:** drei eigene Fotos der Wohnheim-Innenhöfe/Gebäude als Hintergrund (`web/public/wohnheime/`, Anleitung in der README dort), dazu ein dunkles Verlauf-Overlay für Lesbarkeit des Textes. Bilder vor dem Einchecken mit Pillow verkleinert/komprimiert (max. ca. 1200 px breit, JPEG-Qualität ~70) – die meisten Gäste kommen laut Auftrag mobil per QR-Code.
- **Leichter Parallax-Effekt** auf den drei Fotos beim Scrollen, bewusst per kleinem Vanilla-JS (`scroll`-Listener, `requestAnimationFrame`-gedrosselt) statt `background-attachment: fixed` oder CSS-Scroll-Timelines: Fixed-Backgrounds sind auf iOS Safari unzuverlässig, Scroll-Timelines werden dort noch nicht unterstützt. Bei `prefers-reduced-motion: reduce` bleiben die Fotos stehen.
- **Countdown bis zum Festivalbeginn** (`web/src/components/Countdown.astro`) unterhalb des Startbildschirms. Ziel-Zeitpunkt ist `festival.startZeitpunkt` in `config.ts`, aktuell `2027-06-11T00:00:00+02:00` – Mitternacht als bewusster, jederzeit anpassbarer Platzhalter, solange keine genauere Startzeit feststeht. Der HTML-Ausgangszustand zeigt Platzhalter-Striche statt einer zur Build-Zeit berechneten Zahl (sonst könnte bei selten neu gebauter Seite kurz eine falsche Zahl aufblitzen); nach Ablauf erscheint ein Text statt negativer Zahlen.
- **Logo eingesetzt wie ein finales Logo**, obwohl es laut Auftraggeber noch ausgetauscht wird: groß im Startbildschirm, klein in Kopf- und Fußzeile, als Favicon (`web/public/logo.png`). Die Datei bleibt austauschbar an dieser einen zentralen Stelle. `favicon.svg` wurde entfernt.

## Befehle (im Ordner `web/`)

```
npm install          Abhängigkeiten installieren
npm run dev          lokaler Entwicklungsserver
npm run build        Prüfen (astro check) und bauen nach web/dist/; erzeugt auch docs/qr/ und docs/kanaele.md
npm run preview      gebaute Seite lokal ansehen
```

Deployment (im Repo-Wurzelordner): `./deploy/deploy.sh`

## Hinweise für Inhalte (Astro-Seiten)

- Jede Seite liegt in `web/src/pages/<name>.astro`. Der Dateiname ist die Adresse (`infos.astro` -> `/infos/`, `index.astro` ist die Startseite). Der Text steht direkt in der Datei als HTML zwischen `<div class="wrap prose">` und `</div>`: `<h2>` für Zwischenüberschriften, `<p>` für Absätze, `<ul><li>` für Listen.
- Der Kopf der Datei (zwischen den `---`) und die Zeile `<Base title="..." description="...">` legen Titel und Beschreibung fest.
- Geschweifte Klammern `{` und `}` sind in Astro-Texten Sonderzeichen. Im Text vermeiden oder als `{'{'}` schreiben.
- **Neue Seite:** eine Datei in `web/src/pages/` anlegen (am einfachsten `infos.astro` kopieren) und **eine Zeile in der Navigationsliste** in `web/src/layouts/Base.astro` ergänzen (`hauptmenue` oder `fussmenue`). Ohne diese Zeile gibt es die Seite, aber keinen Link darauf.
- Zwischenüberschriften bekommen keine automatischen Anker-`id`s mehr (waren bei Markdown automatisch da, wurden nirgends verwendet).

## Offene Punkte

Siehe `docs/SPEC.md`. Nichts davon erfinden, immer als TODO stehen lassen.
