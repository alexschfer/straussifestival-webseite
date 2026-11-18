# Straussi Festival 2027: Webseite

> [!IMPORTANT]
> **Statistikdaten bis spätestens 31.12.2027 löschen.** So steht es in der Datenschutzerklärung (`web/src/pages/datenschutz.astro`), und Matomo löscht nicht von selbst.
> Löschen: in Matomo die Website löschen (Administration > Websites > Verwalten) oder Matomo samt Datenbank in Plesk entfernen. Auch Datenbank-Backups in Plesk löschen.
> Wird das Datum geändert, beides anpassen: diesen Hinweis und die Datenschutzerklärung.

Infoseite zum Straussi Festival 2027 (Studierendenwohnheime Straußäcker, Stuttgart) mit selbst gehosteten Web-Analytics (Matomo). Die Seite verlinkt auf den externen Ticketshop und misst, über welchen Kanal Besucher kommen und wie viele auf den Ticketbutton klicken.

Kurz: `web/` bauen und nach Plesk bei Cloud86 hochladen, Anleitung samt Matomo-Einrichtung: [deploy/PLESK.md](deploy/PLESK.md). Projektkontext und alle Entscheidungen: [CLAUDE.md](CLAUDE.md). Aufgaben und Stand: [docs/SPEC.md](docs/SPEC.md).

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

- `docs/qr/<slug>.svg`: ein QR-Code pro gedrucktem Kanal (`utm_medium` `scan`: Flyer, Plakat, Sticker, Visitenkarte, Feste usw.); WhatsApp, Instagram, TikTok und Partnerseiten bekommen keinen, dort den Kurz-Link aus `docs/kanaele.md` teilen
- `docs/kanaele.md`: Tabelle aller Kanäle mit UTM-Links (Kanäle, die zu Instagram führen, sind dort markiert)
- `docs/qr/<seite>/<slug>.svg`: dieselben QR-Codes für jede Unterseite, z. B. `docs/qr/redirect-instagram/` (führt **direkt zu Instagram**) und `docs/qr/redirect-ticket/` (führt **direkt zum Ticketshop**). Der Aufruf wird vorher in Matomo gezählt (Ereignis `Instagram` bzw. `Ticket`, Aktion `Weiterleitung`)
- `kalender.ics`: Kalenderdatei für den Knopf „In den Kalender eintragen“

**Kanal mit Ziel Instagram:** Steht in `web/src/data/kanaele.ts` bei einem Kanal `ziel: 'instagram'`, führt schon der normale Kurz-Link `/q/<slug>` gezählt zu Instagram statt auf die Startseite (aktuell `sticker`, `visitenkarte-insta`, `blockparty-str2`, `netthier`, `maschinenbau`). `/q/instagram` bekommt das nie, der Link steht in der Instagram-Bio.

**Vor dem Drucken** muss in `web/.env` die echte `SITE_URL` stehen, sonst zeigen die QR-Codes auf eine Platzhalter-Domain. Der Build warnt in diesem Fall.

## Inhalte ändern

- **Seitentexte:** je eine Datei in `web/src/pages/` (`index.astro` = Startseite, `infos.astro`, `lineup.astro`, `faq.astro`, `anfahrt.astro`, `bewohner.astro`, `impressum.astro`, `datenschutz.astro`). Der Text steht direkt darin als einfaches HTML (`<p>`, `<h2>`, `<ul>`). Stellen mit **TODO** sind noch offen.
- **Englische Version:** jede Seite gibt es zusätzlich in `web/src/pages/en/` (gleicher Dateiname). Änderungen immer in beiden Sprachen machen. Texte von Menü, Fußzeile, Banner usw. stehen zweisprachig in `web/src/i18n.ts`.
- **Neue Seite oder Menüpunkt:** Datei in `web/src/pages/` anlegen und die Navigationsliste oben in `web/src/layouts/Base.astro` ergänzen.
- **Ticket-Link, Datum, Adresse, Kalendertermin, Instagram-Profil, Schalter:** `web/src/config.ts`
- **Kartenbild auf der Anfahrt-Seite:** `web/public/anfahrt/karte.webp`, neu erzeugen mit `web/werkzeug/karte.py` (Anleitung: `web/public/anfahrt/README.md`). Die Quellenangabe „© OpenStreetMap-Mitwirkende“ muss bleiben.
- **Fotos im Instagram-Abschnitt:** Datei in `web/public/insta/` ablegen und in `web/src/config.ts` eintragen (Anleitung: `web/public/insta/README.md`)
- **Marketingkanäle:** `web/src/data/kanaele.ts` (Schreibregel für UTM-Werte: Kleinbuchstaben, keine Umlaute/ß/Leerzeichen, Bindestrich zwischen Wörtern; der Build prüft das)

## Analytics einbinden

In `web/.env` eintragen (siehe `web/.env.example`):

```
PUBLIC_MATOMO_URL=https://stats.<domain>
PUBLIC_MATOMO_SITE_ID=<ID aus Matomo>
```

Fehlt einer der Werte, wird Matomo nicht eingebunden (dann auch kein Cookie-Banner, solange kein Instagram-Widget eingetragen ist) und die Seite funktioniert trotzdem.

## Hosting und Deployment

- **Aktuell:** Webhosting bei Cloud86 mit Plesk, Matomo im selben Webhosting: [deploy/PLESK.md](deploy/PLESK.md)
- Alternative für einen eigenen Server mit Docker (Caddy, Umami, Postgres; derzeit **nicht** in Verwendung): [analytics/README.md](analytics/README.md), [deploy/README.md](deploy/README.md). Achtung: Die Webseite selbst bindet inzwischen Matomo ein, nicht mehr Umami.

ZIP zum Hochladen bauen (im Ordner `web/`):

```
npm run build && cd dist && rm -f ../../straussifestival-webseite.zip && zip -qr ../../straussifestival-webseite.zip .
```
