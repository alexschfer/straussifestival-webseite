# analytics/: Webserver und Statistik

Ein `docker compose`-Stack mit drei Containern:

| Container | Aufgabe |
| --- | --- |
| `caddy` | HTTPS (automatisch per Let's Encrypt). Liefert unter `<domain>` die statische Webseite aus, leitet `stats.<domain>` an Umami weiter. Einziger Container mit offenen Ports. |
| `umami` | Statistik-Software (selbst gehostet, Version festgelegt in `docker-compose.yml`). |
| `db` | Postgres für Umami, Daten im benannten Volume `umami-db-data`. |

| Datei | Zweck |
| --- | --- |
| `docker-compose.yml` | der Stack |
| `Caddyfile` | Routing und HTTPS |
| `.env.example` | Vorlage für alle Einstellungen und Geheimnisse (`.env` wird nie committet) |
| `.env.local.example` | Vorlage für den Test auf dem eigenen Rechner |
| `backup.sh` | nächtliche Datenbanksicherung |

Die Webseite selbst (`web/dist/`) wird nicht im Container gebaut, sondern als fertige Dateien in den Ordner `site/` neben der `docker-compose.yml` gelegt (Anleitung: Phase 3, `deploy/`).

## Lokal mit Docker testen

Voraussetzung: Docker mit Compose. Die Ports 8080 und 8443 müssen frei sein.

```sh
# 1. Webseite bauen, mit lokalen Adressen (im Ordner web/)
cd web
SITE_URL=https://localhost:8443 \
PUBLIC_UMAMI_HOST=https://stats.localhost:8443 \
PUBLIC_UMAMI_WEBSITE_ID=platzhalter \
npm run build

# 2. Stack starten (im Ordner analytics/)
cd ../analytics
cp .env.local.example .env
docker compose up -d
docker compose ps           # nach ca. 30 Sekunden: alle "healthy"/"Up"
```

> `npm run build` überschreibt dabei `docs/kanaele.md` und `docs/qr/` mit `localhost`-Adressen. Danach mit `git checkout docs/` zurücksetzen und nicht committen.

Dann im Browser (die Warnung wegen des selbst signierten Zertifikats ist beim lokalen Test normal):

- Webseite: <https://localhost:8443/>
- Umami: <https://stats.localhost:8443/>, Anmeldung `admin` / `umami`
- QR-Weiterleitung: <https://localhost:8443/q/flyer>

Ein Aufruf von `http://localhost:8080/` leitet lokal auf `https://localhost/` (ohne Port) um. Das ist nur ein Testeffekt der abweichenden Ports; auf dem Server mit 80/443 funktioniert es. Lokal einfach direkt die `https://…:8443`-Adresse öffnen.

Damit der Ticketklick lokal in Umami ankommt: in Umami eine Website anlegen (Einstellungen > Websites), deren ID als `PUBLIC_UMAMI_WEBSITE_ID` setzen und die Seite neu bauen. Aufräumen:

```sh
docker compose down        # stoppen, Daten bleiben
docker compose down -v     # stoppen UND alle Daten des Tests löschen
```

## Betrieb auf dem Server

Auf der VM: `cp .env.example .env`, alle Werte ausfüllen (Geheimnisse mit `openssl rand -hex 32` erzeugen), dann `docker compose up -d`. Voraussetzungen: DNS-Einträge für `<domain>` und `stats.<domain>` zeigen auf die VM, Ports 80 und 443 sind offen. Der vollständige Ablauf steht in `deploy/` (Phase 3).

**Sofort nach dem ersten Start:** Umami hat den Standard-Zugang `admin` / `umami`. Das Passwort ändern, bevor irgendetwas anderes passiert.

Nützliche Befehle (im Ordner `analytics/`):

```sh
docker compose ps                  # Zustand
docker compose logs -f umami       # Logs verfolgen
docker compose pull && docker compose up -d    # Container aktualisieren
```

Umami aktualisieren: Versions-Tag in `docker-compose.yml` ändern (`ghcr.io/umami-software/umami:<version>`), vorher ein Backup machen, dann `docker compose pull && docker compose up -d`.

Datenschutz-Hinweis für die Datenschutzerklärung: Caddy schreibt in dieser Konfiguration keine Zugriffs-Logs. Docker-Logs der Container werden auf 3 Dateien à 10 MB begrenzt.

## Backup und Wiederherstellung

`backup.sh` schreibt eine komprimierte Sicherung (`umami-<datum>_<uhrzeit>.sql.gz`) nach `analytics/backups/` und behält die letzten 14. Andere Ziele oder Anzahl: `BACKUP_DIR=/pfad KEEP=30 ./backup.sh`. Bei einem Fehler bricht das Skript mit Fehlercode ab und lässt die bisherigen Sicherungen unangetastet.

Nächtlich per Cron (als root auf der VM, `crontab -e`):

```cron
15 3 * * * /opt/straussi/analytics/backup.sh >> /var/log/straussi-backup.log 2>&1
```

(Den Pfad an den tatsächlichen Ort des Ordners anpassen.)

**Die Sicherungen liegen auf derselben VM.** Fällt die VM aus, sind sie mit weg. Den Ordner `backups/` deshalb zusätzlich regelmäßig an einen anderen Ort kopieren (z. B. per `rsync` auf einen anderen Rechner).

Wiederherstellen (überschreibt die aktuellen Umami-Daten):

```sh
cd analytics
docker compose stop umami
gunzip -c backups/umami-<datum>_<uhrzeit>.sql.gz \
  | docker compose exec -T db sh -c 'psql -q -U "$POSTGRES_USER" -d "$POSTGRES_DB" -v ON_ERROR_STOP=1'
docker compose start umami
```
