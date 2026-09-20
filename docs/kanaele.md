# Marketingkanäle

> Diese Datei wird beim Build automatisch erzeugt (`npm run build` im Ordner `web/`).
> Nicht von Hand bearbeiten: Kanäle werden in `web/src/data/kanaele.ts` gepflegt.

> **ACHTUNG: Die Domain ist noch ein Platzhalter.** QR-Codes und Links unten zeigen
> auf `https://todo-domain.invalid` und funktionieren nicht. Nichts drucken, bevor `SITE_URL` gesetzt
> und neu gebaut wurde (siehe `web/.env.example`).

Domain: `https://todo-domain.invalid` · Kampagne (`utm_campaign`): `straussi-festival-2027`

- **Kurz-URL**: steht im QR-Code und leitet auf die Startseite mit UTM-Parametern weiter.
- **Fertiger UTM-Link**: das Ziel der Weiterleitung, für Links, die nicht als QR-Code laufen.
- **vorläufig**: Kanal ist noch nicht bestätigt, den QR-Code noch nicht drucken.

| Slug | Status | Beschreibung | Kurz-URL (QR-Code) | Fertiger UTM-Link | QR-Datei |
| --- | --- | --- | --- | --- | --- |
| `flyer` | vorläufig | Flyer, die verteilt werden (allgemein). | `https://todo-domain.invalid/q/flyer` | `https://todo-domain.invalid/?utm_source=flyer&utm_medium=print&utm_campaign=straussi-festival-2027` | [flyer.svg](qr/flyer.svg) |
| `aushang-wohnheim-a` | vorläufig | Aushang im Wohnheim A. | `https://todo-domain.invalid/q/aushang-wohnheim-a` | `https://todo-domain.invalid/?utm_source=aushang&utm_medium=print&utm_campaign=straussi-festival-2027&utm_content=wohnheim-a` | [aushang-wohnheim-a.svg](qr/aushang-wohnheim-a.svg) |
| `aushang-wohnheim-b` | vorläufig | Aushang im Wohnheim B. | `https://todo-domain.invalid/q/aushang-wohnheim-b` | `https://todo-domain.invalid/?utm_source=aushang&utm_medium=print&utm_campaign=straussi-festival-2027&utm_content=wohnheim-b` | [aushang-wohnheim-b.svg](qr/aushang-wohnheim-b.svg) |
| `mensa` | vorläufig | Aushang bzw. Auslage in der Mensa. | `https://todo-domain.invalid/q/mensa` | `https://todo-domain.invalid/?utm_source=mensa&utm_medium=print&utm_campaign=straussi-festival-2027` | [mensa.svg](qr/mensa.svg) |
| `instagram` | vorläufig | Link im Instagram-Profil bzw. in Beiträgen. | `https://todo-domain.invalid/q/instagram` | `https://todo-domain.invalid/?utm_source=instagram&utm_medium=social&utm_campaign=straussi-festival-2027` | [instagram.svg](qr/instagram.svg) |
| `whatsapp` | vorläufig | Link, der in WhatsApp-Gruppen und -Kanälen geteilt wird. | `https://todo-domain.invalid/q/whatsapp` | `https://todo-domain.invalid/?utm_source=whatsapp&utm_medium=messenger&utm_campaign=straussi-festival-2027` | [whatsapp.svg](qr/whatsapp.svg) |
