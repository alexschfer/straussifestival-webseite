# deploy/: Webseite und Analytics auf eine VM bringen

Ziel ist eine einzelne Linux-VM (geplant: Selfnet e. V.). Auf der VM läuft **kein Node**: Die Seite wird auf deinem Rechner gebaut und als fertige Dateien kopiert. Nichts hier ist an einen Anbieter gebunden; für einen Wechsel (z. B. zu Hetzner) ändert sich nur `DEPLOY_HOST`, siehe [Anbieterwechsel](#anbieterwechsel).

```
Dein Rechner                                   VM
web/  --npm run build--> web/dist/  --rsync--> /opt/straussi/site/     (Caddy liefert das aus)
analytics/ (Compose, Caddyfile, backup.sh) --> /opt/straussi/          (docker compose up -d)
```

Alles erledigt `./deploy/deploy.sh`. Es lässt sich beliebig oft wiederholen.

## Voraussetzungen

**Auf deinem Rechner:** Node.js 22.12 oder neuer (nur zum Bauen), `ssh`, `rsync`, `curl`, Git.

**Auf der VM:**

- Root-Zugriff per SSH (mit SSH-Schlüssel), z. B. `ssh root@<vm>`. Ein anderer Benutzer geht, wenn er Docker ohne sudo nutzen und in `DEPLOY_PATH` schreiben darf.
- Docker mit dem Compose-Plugin (`docker compose version` muss funktionieren). Installation: <https://docs.docker.com/engine/install/>
- `rsync` (z. B. `apt install rsync`).
- Erreichbare Ports: 22 (SSH), 80 und 443 (TCP) sowie 443 (UDP, für HTTP/3). Bei einer Firewall des Anbieters diese freigeben. Port 80 wird für die Zertifikate gebraucht.
- Zwei **DNS-Einträge** auf die IP der VM (A, bei IPv6 zusätzlich AAAA): `<domain>` und `stats.<domain>`. **Sie müssen aufgelöst werden, bevor der Stack das erste Mal startet**, sonst kann Caddy kein Zertifikat holen.

> **Offen:** VM, Domain und DNS kommen von Selfnet (Anfrage läuft, siehe `docs/SPEC.md`). Sinnvoll ist eine Domain, die dem Verein gehört und nicht am Anbieter hängt: Sie steht auf allen gedruckten QR-Codes und sollte sich beim Anbieterwechsel nicht ändern.

## Einmalig einrichten

1. **Lokal die Adressen der Seite festlegen** (`web/.env`, Vorlage `web/.env.example`):

   ```sh
   cp web/.env.example web/.env
   ```

   Eintragen: `SITE_URL=https://<domain>` und `PUBLIC_UMAMI_HOST=https://stats.<domain>`. `PUBLIC_UMAMI_WEBSITE_ID` bleibt vorerst leer, die ID gibt es erst nach dem ersten Start (siehe unten).

2. **Lokal die Zugangsdaten zur VM festlegen** (`deploy/deploy.env`, wird nicht committet):

   ```sh
   cp deploy/deploy.env.example deploy/deploy.env
   ```

   Eintragen: `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_PATH` (Standard `/opt/straussi`), `ACME_EMAIL`.

3. **Ticket-URL** in `web/src/config.ts` eintragen, sobald bekannt. Das Skript warnt, solange dort noch `TODO` steht.

## Erster Deploy

```sh
./deploy/deploy.sh
```

Das Skript

1. prüft die Einstellungen (bricht ab, wenn `SITE_URL` noch ein Platzhalter ist),
2. baut die Seite (`npm ci`, `npm run build`),
3. prüft per SSH, ob Docker und rsync auf der VM da sind,
4. kopiert Compose-Datei, Caddyfile und `backup.sh` nach `DEPLOY_PATH` und die Seite nach `DEPLOY_PATH/site/`,
5. legt beim ersten Mal die `.env` auf der VM an, mit `DOMAIN` und `ACME_EMAIL` und **frisch erzeugten Geheimnissen** (sie stehen nur dort, nie im Repo),
6. startet den Stack (`docker compose up -d`), lädt die Caddy-Konfiguration neu und prüft, ob Seite und Umami erreichbar sind.

Der Build erzeugt außerdem `docs/kanaele.md` und `docs/qr/` mit der echten Domain neu. **Diese Änderungen committen**, dann sind die QR-Codes im Repo druckfertig.

Die Geheimnisse liegen nur in `<DEPLOY_PATH>/.env` auf der VM. **Eine Kopie im Passwortmanager ablegen.**

Das Zertifikat kann ein, zwei Minuten dauern. Meldet das Skript am Ende "nicht erreichbar", kurz warten und im Browser prüfen; bleibt es dabei, siehe [Fehlersuche](#fehlersuche).

## Nach dem ersten Start

Umami ist jetzt unter `https://stats.<domain>` erreichbar, mit dem Standard-Zugang, den jeder kennt. Deshalb **sofort** der erste Schritt:

1. **Admin-Passwort ändern.** Anmelden mit Benutzer `admin` und Passwort `umami`, dann in den Profil-/Kontoeinstellungen ein neues, langes Passwort setzen. Erst danach weitermachen. Das neue Passwort in den Passwortmanager.
2. **Website anlegen.** In Umami unter "Settings" > "Websites" > "Add website": Name z. B. "Straußi Festival 2027", Domain `<domain>`.
3. **Website-ID kopieren** (in den Einstellungen der angelegten Website, ein Wert wie `496cd939-2b53-4eb6-ac6a-b6d61292f024`).
4. **In die Web-Config eintragen:** in `web/.env` die Zeile `PUBLIC_UMAMI_WEBSITE_ID=<ID>` ergänzen.
5. **Erneut deployen:** `./deploy/deploy.sh`. Jetzt enthält die Seite das Tracking-Skript.
6. **Prüfen:** Die Seite in einem privaten Fenster über `https://<domain>/q/flyer` öffnen. In Umami unter "Realtime" muss der Besuch erscheinen. Ticketbutton klicken: Es erscheint das Event `ticket-click`. Für die Auswertung "Wie viele Klicks pro Kanal" den Bericht **Attribution** mit dem Event `ticket-click` als Konversion verwenden (siehe `CLAUDE.md`).
7. **Testdaten entfernen** bevor die QR-Codes verteilt werden: In den Einstellungen der Website in Umami die Daten zurücksetzen.

> Die Menünamen in Umami können je nach Version leicht abweichen. Die Abläufe (Anmelden, Passwort ändern, Website anlegen, Website-ID) wurden mit Umami 3.4.0 nur über die Schnittstelle getestet, nicht in der Oberfläche.

## Backup einrichten

`deploy.sh` warnt, solange auf der VM kein Backup-Job läuft. Einrichten (einmalig, auf der VM als root):

```sh
ssh root@<vm>
/opt/straussi/backup.sh                # einmal von Hand testen, legt /opt/straussi/backups/umami-....sql.gz an
crontab -e                             # diese Zeile ergänzen (täglich 03:15 Uhr):
15 3 * * * /opt/straussi/backup.sh >> /var/log/straussi-backup.log 2>&1
```

(Bei anderem `DEPLOY_PATH` den Pfad anpassen.) Es bleiben die letzten 14 Sicherungen.

**Die Sicherungen liegen auf derselben VM.** Zusätzlich regelmäßig auf einen anderen Rechner kopieren, z. B. von dort aus:

```sh
rsync -az root@<vm>:/opt/straussi/backups/ ~/straussi-backups/
```

Wiederherstellen: siehe [analytics/README.md](../analytics/README.md#backup-und-wiederherstellung).

## Alltag

| Was | Wie |
| --- | --- |
| Text oder Kanal geändert | Datei in `web/` ändern, committen, `./deploy/deploy.sh` |
| Neuer Kanal für QR-Codes | `web/src/data/kanaele.ts` ergänzen, `./deploy/deploy.sh`, neue Dateien in `docs/` committen |
| Nur neu hochladen, ohne Neubau | `./deploy/deploy.sh --skip-build` |
| Zustand ansehen | `ssh root@<vm> "cd /opt/straussi && docker compose ps"` |
| Umami aktualisieren | Versions-Tag in `analytics/docker-compose.yml` ändern, vorher Backup, dann `./deploy/deploy.sh` |
| Zurück zu einem früheren Stand | den Git-Stand auschecken (`git checkout <commit>`), `./deploy/deploy.sh` |

## Anbieterwechsel

Getestet (lokal, mit frischer "VM" ohne Vorwissen):

1. Neue VM mit Docker, rsync und SSH-Zugang vorbereiten (wie oben).
2. Letzte Sicherung von der alten VM holen: `rsync -az root@<alt>:/opt/straussi/backups/ ./backups-alt/`
3. `deploy/deploy.env` auf die neue VM umstellen (`DEPLOY_HOST`), `./deploy/deploy.sh` ausführen. Auf der neuen VM entstehen neue Geheimnisse; das ist in Ordnung, sie hängen nicht an den Daten.
4. Backup einspielen: Ordner `backups/` auf die neue VM kopieren und den Restore aus [analytics/README.md](../analytics/README.md#backup-und-wiederherstellung) ausführen. Danach sind Passwort, Website und Statistiken wieder da; die **Website-ID bleibt gleich**, `web/.env` muss also nicht geändert werden.
5. **DNS** auf die neue IP umstellen (vorher die TTL der Einträge senken). Die **Domain darf sich nicht ändern**, sonst laufen die gedruckten QR-Codes ins Leere.
6. Ab jetzt das Backup auf der neuen VM einrichten (Abschnitt oben) und die alte VM abschalten.

## Fehlersuche

Auf der VM im Ordner `/opt/straussi`:

| Symptom | Ursache und Maßnahme |
| --- | --- |
| Skript meldet "nicht erreichbar" | Zertifikat braucht noch Zeit; sonst `docker compose logs caddy` ansehen. Meist zeigt die DNS noch nicht auf die VM oder Port 80/443 ist gesperrt. |
| `stats.<domain>` zeigt "502" | Umami startet noch (bis zu einer Minute) oder ist abgestürzt: `docker compose ps`, `docker compose logs umami`. Die Infoseite läuft trotzdem. |
| Skript bricht bei "Docker ... fehlt" ab | Docker mit Compose-Plugin oder rsync auf der VM installieren; SSH-Zugang prüfen. |
| Nach dem Deploy sieht man alte Inhalte | Browser-Cache leeren (Strg+F5). |
| Datenbank wirkt leer nach Umzug/Neuinstallation | Backup noch nicht eingespielt (Abschnitt Anbieterwechsel) oder `.env` der VM wurde ersetzt und Umami/Postgres wurden mit neuem Passwort neu angelegt. |

## Was auf der VM liegt

```
/opt/straussi/
  docker-compose.yml   kommt aus analytics/ (wird bei jedem Deploy überschrieben)
  Caddyfile            dito
  backup.sh            dito
  .env.example         dito
  .env                 NUR hier: Domain, E-Mail, Geheimnisse (Rechte 600). Wird nie überschrieben.
  site/                die gebaute Webseite (wird bei jedem Deploy ersetzt)
  backups/             Datenbanksicherungen (von backup.sh)
```

Eigene Änderungen direkt auf der VM in den überschriebenen Dateien gehen beim nächsten Deploy verloren. Änderungen immer im Repo machen.
