# Aufgaben und Stand

Kontext, Entscheidungen und Regeln stehen in `CLAUDE.md`.

## Phasen

### Phase 1: `web/` (erledigt)

- [x] Astro statisch, TypeScript, kein UI-Framework
- [x] Seiten als einfache Astro-Seiten (`web/src/pages/*.astro`, gemeinsames Layout, Navigation als Liste im Layout; ursprünglich Markdown/Content Collections, später auf Wunsch umgestellt): Startseite, Infos, FAQ, Anfahrt, Impressum, Datenschutz
- [x] Mobiles, schlichtes Layout (dunkles Thema), Ticketbutton prominent, zentrale Ticket-URL in `web/src/config.ts`
- [x] Instagram-Abschnitt auf der Startseite (Links und Kacheln; optional echter Feed per Widget mit Cookie-Banner)
- [x] Weiterleitung `/redirect-instagram/` mit Zählung in Umami, für QR-Codes direkt zu Instagram (`/redirect-instagram/q/<slug>`, QR-Codes in `docs/qr/redirect-instagram/`)
- [x] Zentrale Kanaldatei `web/src/data/kanaele.ts` mit Validierung der UTM-Schreibregel
- [x] Aus den Kanälen generiert: Redirects `/q/<slug>`, QR-Codes (`docs/qr/`), `docs/kanaele.md`
- [x] Umami-Einbindung über Umgebungsvariablen (ohne Werte kein Skript)
- [x] Ticketbutton löst Umami-Event `ticket-click` aus
- [x] Optionales Skript "UTM an Ticketlink anhängen", per Schalter, Standard AUS
- [x] `CLAUDE.md`, `README.md`, `docs/SPEC.md`

### Phase 2: `analytics/` (erledigt, lokal mit Docker getestet)

- [x] `docker-compose.yml` (Umami mit Postgres-Image, Postgres in benanntem Volume)
- [x] `Caddyfile`: Hauptdomain liefert Astro-Dateien, `stats.<domain>` geht an Umami, automatisches HTTPS
- [x] `.env.example` mit Erklärungen
- [x] `backup.sh`: nächtlicher `pg_dump`, komprimiert, 14 Stände, Cron-Beispiel
- [x] Anleitung: lokal mit Docker testen (`analytics/README.md`)
- [x] `web/src/pages/404.astro` (Caddy braucht `404.html`)
- [ ] Erster Test mit dem **echten Umami-Tracker** im Browser (bisher nur simulierte Requests) und auf der echten VM mit echtem HTTPS

### Phase 3: `deploy/` (erledigt, gegen eine simulierte VM getestet)

- [x] Deployment-Anleitung (`deploy/README.md`) und Deploy-Skript (`deploy/deploy.sh`: lokal bauen, `rsync`, Container hochfahren)
- [x] Schritte nach dem ersten Start: Umami-Admin-Passwort ändern, Website anlegen, Website-ID in die Web-Config eintragen
- [x] Hostunabhängig (nur `DEPLOY_HOST` ändert sich; Anbieterwechsel inkl. Backup-Restore lokal getestet, kein Terraform)
- [ ] Erster echter Deploy auf die Selfnet-VM (wartet auf VM, Domain, DNS)
- [ ] Umami-Oberfläche (Menünamen, Passwort ändern, Website-ID finden, Daten zurücksetzen) einmal im Browser durchgehen und `deploy/README.md` bei Abweichungen anpassen; bisher nur die API-Abläufe getestet
- [ ] Backup-Cron auf der VM einrichten und eine Off-Site-Kopie der Sicherungen organisieren

### Umstieg auf Cloud86-Webhosting und Matomo

- [x] Tracking auf Matomo umgestellt (ohne Cookies, mit Cookies nach Zustimmung), Cookie-Banner immer aktiv mit Matomo
- [x] Datenschutzerklärung auf Cloud86 und Matomo umgestellt, `.htaccess`, Anleitung `deploy/PLESK.md`
- [x] In Plesk: Subdomain `stats`, SSL, Datenbank, Matomo installiert
- [x] In Matomo: IP-Kürzung 2 Bytes, Plugin Marketing Campaigns Reporting, Ziel „Ticketklick“, Site-ID 1
- [x] Protokollrotation `straussifestival.de`: monatlich, 1 Datei (Datenschutz: höchstens 2 Monate)
- [ ] Protokollrotation auch für `stats.straussifestival.de` prüfen
- [ ] Erster Upload, Test mit echten Handys, Testdaten löschen
- [ ] **Bio-Links** auf die Kurz-URLs umstellen: Instagram `straussifestival.de/q/instagram`, TikTok `straussifestival.de/q/tiktok` (Instagram-Bio enthält derzeit nicht die Kurz-URL, in Matomo erschien `ig`)
- [x] Auffangregel `ig` -> `instagram` (`fremdeQuellen` in `web/src/data/kanaele.ts`)
- [ ] DPA von Cloud86 herunterladen und beim Verein ablegen; prüfen, ob das Cloud86-Konto auf Straussi 1 e.V. läuft

## Offene Punkte (TODO, nicht erfinden)

- [ ] **Uhrzeiten des Festivals:** Kalendereintrag ist ganztägig (`kalender` in `web/src/config.ts`), der Countdown zählt bis Mitternacht. Mit echten Zeiten beides anpassen.
- [ ] Karte und Kalender-Knopf auf echten Handys testen (Apple Karten/Kalender auf iPhone, Google Maps/Kalender auf Android)

- [ ] **Antwort von Selfnet:** VM, Domain, DNS
- [ ] **Echte Ticketshop-URL** eintragen (`ticket.url` in `web/src/config.ts`)
- [ ] **Wertet der Ticketshop UTM-Parameter aus?** (Anfrage läuft.) Erst danach den Schalter `ticket.utmWeitergeben` in `web/src/config.ts` auf `true` setzen.
- [x] **Impressum**: Veranstalter ist Straussi 1 e.V.; Angaben aus dessen Impressum übernommen (https://straussi1.de/wohnheim/rechtliches/impressum, Stand 20.10.2026)
- [ ] Copyright-Zeile in der Fußzeile ggf. auf Straussi 1 e.V. anpassen (`web/src/layouts/Base.astro`)
- [x] **Kontaktadresse** `info@straussifestival.de` (`festival.email` in `web/src/config.ts`, Fußzeile und Impressum)
- [ ] Postfach `info@straussifestival.de` muss wirklich existieren und gelesen werden (E-Mail-Hosting/MX für die Domain)
- [x] **Kanalliste** festgelegt: `flyer`, `plakat`, `sticker` (Medium `scan`), `whatsapp` (`messenger`), `instagram`, `tiktok` (`social`); dazu pro Wohnheimfest ein eigener QR-Kanal: `kattafest-str1`, `winterfest-str3`, `halloween-str1` (je ein QR-Code, Medium `scan`)
- [ ] **Festivalinhalte** (Datum, Line-up, Preise, Anfahrt, FAQ-Antworten; alles `TODO` in `web/src/pages/` und `web/src/config.ts`)
- [ ] **`SITE_URL` setzen**, sobald die Domain feststeht, und die QR-Codes neu bauen. Erst dann drucken.
- [ ] **Eigene Fotos** für die Instagram-Kacheln ablegen (`web/public/insta/`, aktuell Platzhalter "TODO Foto"). Das Profil `@straussifestival` ist eingetragen.
- [x] Datenschutzerklärung ausgefüllt (Straussi 1 e.V. als Verantwortlicher, tatsächlicher technischer Aufbau)
- [ ] Datenschutz: **Serverstandort** klären (eigene Hardware oder gemieteter Server? Bei Miete den Anbieter nennen), **Statistik bis 31.12.2027 löschen** (steht in Datenschutzerklärung und oben in README.md)
- [ ] Datenschutzerklärung und Impressum rechtlich prüfen lassen
- [ ] **Instagram-Widget bei LightWidget** anlegen (Anbieter entschieden, kostenlos) und in `instagram.widget` in `web/src/config.ts` eintragen (Anleitung: `web/public/insta/README.md`); danach Abschnitt `#instagram-feed` der Datenschutzerklärung vervollständigen und prüfen lassen

## Zu prüfen (Risiken, die beim Bau aufgefallen sind)

- [ ] **Kanalzuordnung über mehrere Seiten.** Umami liest UTM-Parameter aus der URL des jeweiligen Aufrufs; ein Klick auf einer Unterseite (z. B. `/infos/`) trägt selbst keine UTMs. Getestet mit Umami 3.4.0 und simulierten Requests: Der Bericht **Attribution** (Konversion = Event `ticket-click`) ordnet den Klick trotzdem dem Einstiegskanal zu. Ein Filter direkt auf das Event nach UTM würde ihn dagegen verpassen. Deshalb für die Auswertung den Attributionsbericht verwenden und nach dem ersten Start mit dem echten Tracker gegenprüfen. Nur falls das nicht reicht: UTM-Parameter per kleinem Skript an interne Links weitergeben (ohne Cookie, ohne localStorage).
- [ ] **Redirects sind Meta-Refresh-Seiten**, keine HTTP-301 (Eigenschaft von Astro im statischen Modus). Caddy liefert `/q/<slug>` direkt aus, ohne zusätzlichen Umweg. Echte 301er wären nur mit Caddy-Regeln möglich, sind aber nicht nötig.
- [ ] **QR-Codes in `docs/qr/` zeigen erst nach Setzen von `SITE_URL` auf die echte Adresse.** `docs/kanaele.md` warnt, solange die Platzhalter-Domain gilt.
- [ ] **Datenschutzerklärung:** Caddy schreibt keine Zugriffs-Logs (steht so in der Erklärung). Klären, ob der Serveranbieter bzw. das Netz eigene Logs führt (siehe TODO-Kommentar in `web/src/pages/datenschutz.astro`).
