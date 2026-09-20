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
deploy/          Deployment-Anleitung und Skripte                          (Phase 3)
```

## Entscheidungen (aus dem Auftrag)

### Web (Phase 1)

- Astro im statischen Modus (`output: 'static'`), TypeScript, **kein SSR, kein UI-Framework**, so wenig JavaScript wie möglich.
- Seiteninhalte als **Markdown über Content Collections** (`web/src/content/seiten/`), damit auch nichttechnische Leute editieren können. Seiten: Startseite (`start.md`), Infos, FAQ, Anfahrt, Impressum, Datenschutz. Impressum und Datenschutz mit TODO-Platzhaltern, der Verein ist noch nicht gegründet.
- Responsives, schlichtes Layout, mobil zuerst.
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

### Deployment (Phase 3)

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

## Befehle (im Ordner `web/`)

```
npm install          Abhängigkeiten installieren
npm run dev          lokaler Entwicklungsserver
npm run build        Prüfen (astro check) und bauen nach web/dist/; erzeugt auch docs/qr/ und docs/kanaele.md
npm run preview      gebaute Seite lokal ansehen
```

## Hinweise für Inhalte (Markdown)

- Seiten liegen in `web/src/content/seiten/*.md`. Der Dateiname ist die Adresse (`infos.md` -> `/infos/`).
- Der Kopf zwischen den `---` (Frontmatter) braucht **Anführungszeichen um Texte**, sobald ein Doppelpunkt vorkommt, sonst bricht der Build ab. Am sichersten: immer `title: "..."` und `description: "..."` in Anführungszeichen.
- Neue Seite: neue `.md`-Datei mit `title`, `description` und `navigation` (`haupt`, `fuss` oder `keine`). Sie erscheint automatisch.

## Offene Punkte

Siehe `docs/SPEC.md`. Nichts davon erfinden, immer als TODO stehen lassen.
