# Marketingkanäle

> Diese Datei wird beim Build automatisch erzeugt (`npm run build` im Ordner `web/`).
> Nicht von Hand bearbeiten: Kanäle werden in `web/src/data/kanaele.ts` gepflegt.

> **ACHTUNG: Die Domain ist noch ein Platzhalter.** QR-Codes und Links unten zeigen
> auf `https://todo-domain.invalid` und funktionieren nicht. Nichts drucken, bevor `SITE_URL` gesetzt
> und neu gebaut wurde (siehe `web/.env.example`).

Domain: `https://todo-domain.invalid` · Kampagne (`utm_campaign`): `straussi-festival-2027`

- **Kurz-URL**: steht im QR-Code und leitet auf die Startseite mit UTM-Parametern weiter.
- **Fertiger UTM-Link**: das Ziel der Weiterleitung, für Links, die nicht als QR-Code laufen.

| Slug | Beschreibung | Kurz-URL (QR-Code) | Fertiger UTM-Link | QR-Datei |
| --- | --- | --- | --- | --- |
| `flyer` | QR-Code auf den Flyern. | `https://todo-domain.invalid/q/flyer` | `https://todo-domain.invalid/?utm_source=flyer&utm_medium=scan&utm_campaign=straussi-festival-2027` | [flyer.svg](qr/flyer.svg) |
| `plakat` | QR-Code auf den Plakaten bzw. Aushängen. | `https://todo-domain.invalid/q/plakat` | `https://todo-domain.invalid/?utm_source=plakat&utm_medium=scan&utm_campaign=straussi-festival-2027` | [plakat.svg](qr/plakat.svg) |
| `whatsapp` | Link, der in WhatsApp-Gruppen und -Kanälen geteilt wird. Immer diesen Link teilen, nie nur die Domain. | `https://todo-domain.invalid/q/whatsapp` | `https://todo-domain.invalid/?utm_source=whatsapp&utm_medium=messenger&utm_campaign=straussi-festival-2027` | [whatsapp.svg](qr/whatsapp.svg) |
| `instagram` | Link in der Instagram-Bio bzw. in Stories. | `https://todo-domain.invalid/q/instagram` | `https://todo-domain.invalid/?utm_source=instagram&utm_medium=social&utm_campaign=straussi-festival-2027` | [instagram.svg](qr/instagram.svg) |
| `tiktok` | Link in der TikTok-Bio. | `https://todo-domain.invalid/q/tiktok` | `https://todo-domain.invalid/?utm_source=tiktok&utm_medium=social&utm_campaign=straussi-festival-2027` | [tiktok.svg](qr/tiktok.svg) |

## Auf eine Unterseite zeigen

Jeder Kanal funktioniert hinter **jeder** Seite: einfach `/q/<slug>` an den Seitenpfad
hängen. Die UTM-Parameter sind dabei immer dieselben, nur die Seite ändert sich.

```
https://todo-domain.invalid/q/mensa           ->  Startseite
https://todo-domain.invalid/lineup/q/mensa    ->  Line-up-Seite
```

Die passenden QR-Codes liegen fertig im Ordner `qr/` bereit:

| Seite | QR-Codes |
| --- | --- |
| `/` | [qr/](qr/) |
| `/anfahrt/` | [qr/anfahrt/](qr/anfahrt/) |
| `/datenschutz/` | [qr/datenschutz/](qr/datenschutz/) |
| `/faq/` | [qr/faq/](qr/faq/) |
| `/impressum/` | [qr/impressum/](qr/impressum/) |
| `/infos/` | [qr/infos/](qr/infos/) |
| `/lineup/` | [qr/lineup/](qr/lineup/) |
| `/redirect-instagram/` (führt direkt zu Instagram) | [qr/redirect-instagram/](qr/redirect-instagram/) |
