# Straußi Festival 2027: Webseite und Web-Analytics

## Kontext

Das Straußi Festival 2027 ist ein Festival der Studierendenwohnheime Straußäcker in Stuttgart, veranstaltet von einem Team aus Bewohner*innen von Straußi 1, 2 & 3, mit rund 7500 erwarteten Gästen.

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
docs/qr/         QR-Codes als SVG pro Kanal und Seite (GENERIERT)
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

- **Eine einzige Datenquelle** für alle Marketingkanäle: `web/src/data/kanaele.ts`. Pro Kanal: Slug, `utm_source`, `utm_medium`, `utm_content` (optional), Beschreibung.
- Daraus werden beim Build automatisch erzeugt:
  1. Redirects `<seite>/q/<slug>` -> `<seite>?utm_...` (`redirects`-Option in `astro.config.ts`). **`/q/<slug>` funktioniert hinter jeder Seite**, also `/q/mensa` (Startseite), `/lineup/q/mensa`, `/infos/q/mensa` usw. Die Seitenliste liest `web/integrations/seiten.ts` automatisch aus `src/pages/`; eine neue Seite bekommt ihre Weiterleitungen dadurch von selbst. Ein Kanal braucht dafür keinen Eintrag, die UTM-Parameter sind für jede Zielseite gleich.
  2. Ein QR-Code als SVG pro Kanal **und Seite** (npm-Paket `qrcode`): `docs/qr/<slug>.svg` für die Startseite, `docs/qr/<seite>/<slug>.svg` für die übrigen Seiten.
  3. `docs/kanaele.md`: Tabelle mit Slug, fertigem UTM-Link und QR-Datei.
  (2 und 3 erledigt die Integration `web/integrations/kanaele-output.ts` im Hook `astro:build:done`.)
- `utm_campaign` ist immer `straussi-festival-2027`.
- **Schreibregel für UTM-Werte** (und Slugs): nur Kleinbuchstaben (und Ziffern), keine Umlaute, kein ß, keine Leerzeichen, Wörter mit Bindestrich. Wird **beim Build per Validierung erzwungen** (`validiereKanaele` in `kanaele.ts`; der Build bricht bei Verstoß ab). Doppelte Slugs brechen den Build ebenfalls ab.
- Beispielkanäle sind angelegt (noch nicht bestätigt, siehe `docs/SPEC.md`): flyer, aushang-wohnheim-a, aushang-wohnheim-b, mensa, instagram, whatsapp.

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
- Mediums der Beispielkanäle: `print` (Flyer, Aushänge, Mensa), `social` (Instagram), `messenger` (WhatsApp). Vorläufig.
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
- Solange `instagram.profilUrl` in `web/src/config.ts` noch `TODO` enthält, warnen der Build und `deploy.sh` (aktuell erledigt, das Profil ist echt eingetragen). Ohne eingetragene Fotos zeigen die Kacheln weiterhin "TODO Foto".
- **Fußzeile nach Vorbild von Ricola:** ein abgerundetes Panel mit vier Spalten (Folge uns mit Instagram- und TikTok-Knopf, Festival mit den Menülinks, Tickets mit Button, Kontakt) und darunter einer schmalen Leiste: links Festivalname und Veranstalter, rechts Impressum, Datenschutz und "© Straußi Festival 2027". Mobil stehen die Spalten untereinander. Menülinks und Rechtslinks kommen aus den Listen im Layout (`hauptmenue`, `fussmenue`).
- **Der Ticketbutton kommt jetzt dreimal vor** (Kopfzeile, Startseiten-Kopf, Fußzeile). Das Klick-Event `ticket-click` ist dasselbe; die Stelle steht als `position` (`header`, `hero`, `footer`) im Event und lässt sich in Umami unterscheiden.
- **Die Copyright-Zeile nennt bewusst keinen Rechteinhaber und kein Jahr.** Wer im Impressum verantwortlich ist, steht noch nicht fest (Verein nicht gegründet). Erst danach dort den passenden Rechteinhaber eintragen.
- `festival.name` wird in `config.ts` aus `kurzname` und `jahr` zusammengesetzt, damit die Jahreszahl im Kopf farblich abgesetzt werden kann und nur an einer Stelle steht.
- Die Datenschutzseite hat einen zusätzlichen Abschnitt zu den Links zu Instagram und TikTok (mit TODO für die rechtliche Prüfung).

## Entscheidungen aus der Scroll-Neugestaltung (jederzeit änderbar)

- **Fließender Scroll mit sanften Einblend-Animationen**, kein Scroll-Snap/Einrasten (Vorbild: Fusion-Festival-Archivseiten). Abschnitte bekommen die Klasse `.einblenden`; ein `IntersectionObserver` in `index.astro` ergänzt beim Scrollen einmalig `.sichtbar`. **Ausgeblendet wird nur, wenn das Skript läuft** (es setzt selbst `.einblenden-aktiv` am `<html>`); sonst blieb auf manchen Handys alles zwischen Kopf- und Fußzeile leer. Nicht wieder auf reines CSS-Ausblenden umstellen. Der ausgeblendete Ausgangszustand steht in `global.css` bewusst nur innerhalb von `@media (prefers-reduced-motion: no-preference)` – wer reduzierte Bewegung eingestellt hat, sieht alle Inhalte sofort.
- **Startbildschirm mit Fotocollage:** drei eigene Fotos der Wohnheim-Innenhöfe/Gebäude als Hintergrund (`web/public/wohnheime/`, Anleitung in der README dort), dazu ein dunkles Verlauf-Overlay für Lesbarkeit des Textes. Bilder vor dem Einchecken mit Pillow verkleinert/komprimiert (max. ca. 1200 px breit, JPEG-Qualität ~70) – die meisten Gäste kommen laut Auftrag mobil per QR-Code.
- **Leichter Parallax-Effekt** auf den drei Fotos beim Scrollen, bewusst per kleinem Vanilla-JS (`scroll`-Listener, `requestAnimationFrame`-gedrosselt) statt `background-attachment: fixed` oder CSS-Scroll-Timelines: Fixed-Backgrounds sind auf iOS Safari unzuverlässig, Scroll-Timelines werden dort noch nicht unterstützt. Bei `prefers-reduced-motion: reduce` bleiben die Fotos stehen.
- **Countdown bis zum Festivalbeginn** (`web/src/components/Countdown.astro`) unterhalb des Startbildschirms. Ziel-Zeitpunkt ist `festival.startZeitpunkt` in `config.ts`, aktuell `2027-06-11T00:00:00+02:00` – Mitternacht als bewusster, jederzeit anpassbarer Platzhalter, solange keine genauere Startzeit feststeht. Der HTML-Ausgangszustand zeigt Platzhalter-Striche statt einer zur Build-Zeit berechneten Zahl (sonst könnte bei selten neu gebauter Seite kurz eine falsche Zahl aufblitzen); nach Ablauf erscheint ein Text statt negativer Zahlen.
- **Logo eingesetzt wie ein finales Logo**, obwohl es laut Auftraggeber noch ausgetauscht wird: groß im Startbildschirm, klein in Kopf- und Fußzeile, als Favicon (`web/public/logo.png`). Die Datei bleibt austauschbar an dieser einen zentralen Stelle. `favicon.svg` wurde entfernt.
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
- Das jetzige Logo hat noch die alten Farben (Himbeerpink/Goldorange); es wird laut Auftraggeber ausgetauscht.

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
