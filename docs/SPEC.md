# Aufgaben und Stand

Kontext, Entscheidungen und Regeln stehen in `CLAUDE.md`.

## Phasen

### Phase 1: `web/` (erledigt)

- [x] Astro statisch, TypeScript, kein UI-Framework
- [x] Seiten als Markdown (Content Collection): Startseite, Infos, FAQ, Anfahrt, Impressum, Datenschutz
- [x] Mobiles, schlichtes Layout, Ticketbutton prominent, zentrale Ticket-URL in `web/src/config.ts`
- [x] Zentrale Kanaldatei `web/src/data/kanaele.ts` mit Validierung der UTM-Schreibregel
- [x] Aus den Kanälen generiert: Redirects `/q/<slug>`, QR-Codes (`docs/qr/`), `docs/kanaele.md`
- [x] Umami-Einbindung über Umgebungsvariablen (ohne Werte kein Skript)
- [x] Ticketbutton löst Umami-Event `ticket-click` aus
- [x] Optionales Skript "UTM an Ticketlink anhängen", per Schalter, Standard AUS
- [x] `CLAUDE.md`, `README.md`, `docs/SPEC.md`

### Phase 2: `analytics/` (offen)

- [ ] `docker-compose.yml` (Umami mit Postgres-Image, Postgres in benanntem Volume)
- [ ] `Caddyfile`: Hauptdomain liefert Astro-Dateien, `stats.<domain>` geht an Umami, automatisches HTTPS
- [ ] `.env.example` mit Erklärungen
- [ ] `backup.sh`: nächtlicher `pg_dump`, komprimiert, 14 Stände, Cron-Beispiel
- [ ] Anleitung: lokal mit Docker testen

### Phase 3: `deploy/` (offen)

- [ ] Deployment-Anleitung und einfaches Deploy-Skript (lokal bauen, `rsync`, Container hochfahren)
- [ ] Schritte nach dem ersten Start: Umami-Admin-Passwort ändern, Website anlegen, Website-ID in die Web-Config eintragen
- [ ] Hostunabhängig halten (Selfnet jetzt, später z. B. Hetzner)

## Offene Punkte (TODO, nicht erfinden)

- [ ] **Antwort von Selfnet:** VM, Domain, DNS
- [ ] **Echte Ticketshop-URL** eintragen (`ticket.url` in `web/src/config.ts`)
- [ ] **Wertet der Ticketshop UTM-Parameter aus?** (Anfrage läuft.) Erst danach den Schalter `ticket.utmWeitergeben` in `web/src/config.ts` auf `true` setzen.
- [ ] **Verantwortliche Person für das Impressum**, solange kein e. V. besteht
- [ ] **Endgültige Kanalliste** (aktuell nur vorläufige Beispiele in `web/src/data/kanaele.ts`) und **Festivalinhalte** (Datum, Line-up, Preise, Anfahrt, FAQ-Antworten; alles `TODO` in `web/src/content/seiten/` und `web/src/config.ts`)
- [ ] **`SITE_URL` setzen**, sobald die Domain feststeht, und die QR-Codes neu bauen. Erst dann drucken.
- [ ] Datenschutzerklärung und Impressum rechtlich prüfen lassen

## Zu prüfen (Risiken, die beim Bau aufgefallen sind)

- [ ] **Kanalzuordnung über mehrere Seiten.** Umami liest UTM-Parameter aus der URL des jeweiligen Aufrufs. Landet ein Besucher per QR-Code auf `/?utm_...` und klickt dort direkt auf den Ticketbutton, ist die Zuordnung gesichert. Wechselt er vorher auf eine Unterseite (z. B. `/infos/`), fehlen die UTMs in der URL, und der Klick lässt sich möglicherweise keinem Kanal mehr zuordnen. Nach dem ersten Start mit der eingesetzten Umami-Version testen (Klick-Event nach Seitenwechsel: erscheint der Kanal?). Falls nicht, UTM-Parameter per kleinem Skript an interne Links weitergeben (ähnlich wie beim Ticketlink; ohne Cookie und ohne localStorage).
- [ ] **Redirects sind Meta-Refresh-Seiten**, keine HTTP-301 (Eigenschaft von Astro im statischen Modus). Falls gewünscht, kann Caddy in Phase 2 echte Redirects ausliefern.
- [ ] **QR-Codes in `docs/qr/` zeigen erst nach Setzen von `SITE_URL` auf die echte Adresse.** `docs/kanaele.md` warnt, solange die Platzhalter-Domain gilt.
