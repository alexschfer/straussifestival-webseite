# Straußi Festival 2027: Webseite

Infoseite zum Straußi Festival 2027 (Studierendenwohnheime Straußäcker, Stuttgart) mit selbst gehosteten Web-Analytics (Umami). Die Seite verlinkt auf den externen Ticketshop und misst, über welchen Kanal Besucher kommen und wie viele auf den Ticketbutton klicken.

Projektkontext und alle Entscheidungen: [CLAUDE.md](CLAUDE.md). Aufgaben und Stand: [docs/SPEC.md](docs/SPEC.md).

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

**Vor dem Drucken** muss in `web/.env` die echte `SITE_URL` stehen, sonst zeigen die QR-Codes auf eine Platzhalter-Domain. Der Build warnt in diesem Fall.

## Inhalte ändern

- **Seitentexte:** Markdown-Dateien in `web/src/content/seiten/` (Startseite, Infos, FAQ, Anfahrt, Impressum, Datenschutz). Stellen mit **TODO** sind noch offen.
  Im Kopf jeder Datei (zwischen den `---`) Texte immer in Anführungszeichen setzen: `title: "..."`.
- **Ticket-Link, Datum, Schalter:** `web/src/config.ts`
- **Marketingkanäle:** `web/src/data/kanaele.ts` (Schreibregel für UTM-Werte: Kleinbuchstaben, keine Umlaute/ß/Leerzeichen, Bindestrich zwischen Wörtern; der Build prüft das)

## Analytics einbinden

In `web/.env` eintragen (siehe `web/.env.example`):

```
PUBLIC_UMAMI_HOST=https://stats.<domain>
PUBLIC_UMAMI_WEBSITE_ID=<ID aus Umami>
```

Fehlt einer der Werte, wird das Tracking-Skript nicht eingebunden und die Seite funktioniert trotzdem.

## Analytics-Server und Deployment

Folgt in Phase 2 (`analytics/`) und Phase 3 (`deploy/`).
