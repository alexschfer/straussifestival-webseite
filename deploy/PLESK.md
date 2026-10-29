# Hosting bei Cloud86 (Webhosting mit Plesk) und Matomo

So läuft die Seite aktuell: **Webhosting „Medium“ bei Cloud86** mit Plesk. Dort gibt es kein Docker, deshalb:

- Die Webseite wird **lokal gebaut** und als fertige Dateien nach `httpdocs` hochgeladen.
- Die Statistik ist **Matomo** (PHP/MySQL) unter `stats.straussifestival.de`, im selben Webhosting.
- `analytics/` (Docker, Caddy, Umami) und `deploy/deploy.sh` sind die Alternative für einen eigenen Server und werden hier **nicht** benutzt.

Die Menünamen in Plesk und Matomo können je nach Version leicht abweichen.

## 1. Einmalig: Domain und Subdomain in Plesk

1. **Websites & Domains:** Prüfen, ob `straussifestival.de` als Website angelegt ist (Dokumentenstamm `httpdocs`). Die Nextcloud unter `cloud.straussifestival.de` nicht anfassen.
2. **Subdomain hinzufügen:** `stats.straussifestival.de` (eigener Dokumentenstamm, z. B. `stats.straussifestival.de`).
3. **SSL/TLS-Zertifikate:** Für `straussifestival.de`, `www.straussifestival.de` und `stats.straussifestival.de` ein kostenloses Let's-Encrypt-Zertifikat holen. Kontakt-E-Mail: `orga@straussifestival.de`.
4. **PHP-Einstellungen** der Subdomain `stats`: PHP 8.1 oder neuer.
5. **Logs (Pflicht, steht so in der Datenschutzerklärung):** Bei `straussifestival.de` und `stats.straussifestival.de` unter *Logs > Protokollrotation*: nach Zeit **monatlich** (täglich ist bei Cloud86 gesperrt), maximale Anzahl Protokolldateien **1**, nicht per E-Mail senden. Ergibt höchstens ca. 2 Monate Speicherdauer.

## 2. Einmalig: Matomo installieren

1. **Datenbanken > Datenbank hinzufügen:** MySQL/MariaDB, Name z. B. `matomo`, mit eigenem Benutzer und starkem Passwort (Passwortmanager).
2. Matomo herunterladen: <https://matomo.org/download/> (ZIP, aktuelle Version).
3. In Plesk im **Dateimanager** den Ordner der Subdomain `stats` öffnen, die ZIP hochladen und dort entpacken. Matomo liegt danach in einem Unterordner `matomo/`: dessen **Inhalt** eine Ebene nach oben verschieben, so dass `index.php` direkt im Ordner der Subdomain liegt.
4. `https://stats.straussifestival.de` öffnen und den Installationsassistenten durchklicken:
   - Datenbank: Server `localhost`, Name, Benutzer, Passwort aus Schritt 1.
   - Superuser anlegen (Login für die Statistik, Passwort in den Passwortmanager).
   - Erste Website: Name `Straussi Festival`, Adresse `https://straussifestival.de`, Zeitzone `Europe/Berlin`.
   - Den angezeigten Tracking-Code **nicht** einbauen, das macht die Seite selbst.
5. Die **Website-ID** (meist `1`) in `web/.env` bei `PUBLIC_MATOMO_SITE_ID` eintragen.

## 3. Einmalig: Matomo einstellen

- **Administration > Datenschutz > Daten anonymisieren:** IP-Adressen um **2 Bytes** kürzen, auch für die Standortbestimmung („Anonymisierte IP-Adressen auch beim Anreichern verwenden“). Steht so in der Datenschutzerklärung.
- **Administration > Marketplace:** Plugin **„Marketing Campaigns Reporting“** (kostenlos) installieren und aktivieren. Erst damit zeigt Matomo `utm_source`, `utm_medium` und `utm_content` einzeln an (Flyer/Plakat/Sticker, Scan/Messenger/Social).
- **Ziele > Ziele verwalten > Ziel hinzufügen:** Name `Ticketklick`, Auslöser **Ereignis**, Kategorie ist genau `Ticket`. Damit zeigt Matomo pro Kanal, wie viele Ticketklicks er bringt.
- Optional: **Administration > System > Allgemeine Einstellungen > Archivierung:** Bei wenig Verkehr reicht die Standardeinstellung (Berichte werden beim Ansehen berechnet).

## 4. Webseite hochladen (bei jeder Änderung)

```sh
cd web
npm ci
npm run build                       # prüft und baut nach web/dist/
cd dist && rm -f ../../straussifestival-webseite.zip && zip -qr ../../straussifestival-webseite.zip . && cd ../..
```

Dann in Plesk im **Dateimanager** `httpdocs` öffnen, `straussifestival-webseite.zip` hochladen, **entpacken (vorhandene Dateien überschreiben)** und die ZIP wieder löschen. Die Datei `.htaccess` gehört mit dazu (HTTPS, www-Weiterleitung, 404-Seite).

Danach `docs/` committen, falls sich QR-Codes oder `docs/kanaele.md` geändert haben.

> Alte Dateien bleiben beim Entpacken liegen. Wird eine Seite gelöscht oder umbenannt, ihren Ordner in `httpdocs` von Hand löschen.

## 5. Nach dem ersten Hochladen prüfen

- `https://straussifestival.de`, `https://straussifestival.de/q/flyer` und `https://straussifestival.de/redirect-instagram/q/flyer` öffnen.
- In Matomo unter **Besucher > Echtzeit** muss der Besuch erscheinen, unter **Akquisition > Kampagnen** mit Quelle `flyer`.
- Jeden QR-Code mit iPhone und Android scannen.
- Testbesuche danach löschen (z. B. unter *Administration > Datenschutz > GDPR-Tools* oder die Website-Daten löschen), bevor die QR-Codes verteilt werden.

## Laufend

- **Matomo-Updates einspielen**, sobald Matomo oben eins anzeigt (Knopf im Admin-Bereich). Vorher in Plesk ein Backup der Datenbank.
- **Statistik bis 31.12.2027 löschen** (siehe Hinweis oben in der README).
