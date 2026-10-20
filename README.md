# Straußi Festival 2027: Webseite

Infoseite zum Straußi Festival 2027 (Studierendenwohnheime Straußäcker, Stuttgart) mit selbst gehosteten Web-Analytics (Umami). Die Seite verlinkt auf den externen Ticketshop und misst, über welchen Kanal Besucher kommen und wie viele auf den Ticketbutton klicken.

Kurz: `web/` bauen, mit `./deploy/deploy.sh` auf die VM bringen. Projektkontext und alle Entscheidungen: [CLAUDE.md](CLAUDE.md). Aufgaben und Stand: [docs/SPEC.md](docs/SPEC.md).

## Lokal starten

Voraussetzung: Node.js 22.12 oder neuer.

```sh
cd web
npm install
cp .env.example .env    # optional; ohne .env läuft alles mit Platzhaltern
npm run dev             # http://localhost:4321
```

## Bauen

```sh
cd web
npm run build           # prüft und baut nach web/dist/
npm run preview         # gebaute Seite ansehen
```

Der Build erzeugt außerdem:

- `docs/qr/<slug>.svg`: ein QR-Code pro Marketingkanal (für den Druck)
- `docs/kanaele.md`: Tabelle aller Kanäle mit UTM-Links
- `docs/qr/instagram/<slug>.svg`: QR-Codes, die **direkt zu Instagram** führen (Aufruf wird vorher in Umami gezählt, Auswertung unter Seite `/instagram/`)

**Vor dem Drucken** muss in `web/.env` die echte `SITE_URL` stehen, sonst zeigen die QR-Codes auf eine Platzhalter-Domain. Der Build warnt in diesem Fall.

## Inhalte ändern

- **Seitentexte:** je eine Datei in `web/src/pages/` (`index.astro` = Startseite, `infos.astro`, `faq.astro`, `anfahrt.astro`, `impressum.astro`, `datenschutz.astro`). Der Text steht direkt darin als einfaches HTML (`<p>`, `<h2>`, `<ul>`). Stellen mit **TODO** sind noch offen.
- **Neue Seite oder Menüpunkt:** Datei in `web/src/pages/` anlegen und die Navigationsliste oben in `web/src/layouts/Base.astro` ergänzen.
- **Ticket-Link, Datum, Instagram-Profil, Schalter:** `web/src/config.ts`
- **Fotos im Instagram-Abschnitt:** Datei in `web/public/insta/` ablegen und in `web/src/config.ts` eintragen (Anleitung: `web/public/insta/README.md`)
- **Marketingkanäle:** `web/src/data/kanaele.ts` (Schreibregel für UTM-Werte: Kleinbuchstaben, keine Umlaute/ß/Leerzeichen, Bindestrich zwischen Wörtern; der Build prüft das)

## Analytics einbinden

In `web/.env` eintragen (siehe `web/.env.example`):

```
PUBLIC_UMAMI_HOST=https://stats.<domain>
PUBLIC_UMAMI_WEBSITE_ID=<ID aus Umami>
```

Fehlt einer der Werte, wird das Tracking-Skript nicht eingebunden und die Seite funktioniert trotzdem.

## Analytics-Server und Deployment

- Server-Stack (Caddy, Umami, Postgres, Backup) und lokaler Docker-Test: [analytics/README.md](analytics/README.md)
- Deployment auf die VM (`./deploy/deploy.sh`), Schritte nach dem ersten Start, Backup, Anbieterwechsel: [deploy/README.md](deploy/README.md)
