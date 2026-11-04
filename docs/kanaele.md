# Marketingkanäle

> Diese Datei wird beim Build automatisch erzeugt (`npm run build` im Ordner `web/`).
> Nicht von Hand bearbeiten: Kanäle werden in `web/src/data/kanaele.ts` gepflegt.

Domain: `https://straussifestival.de` · Kampagne (`utm_campaign`): `straussi-festival-2027`

- **Kurz-URL**: steht im QR-Code bzw. wird geteilt und leitet auf die Startseite mit UTM-Parametern weiter.
- **Fertiger UTM-Link**: das Ziel der Weiterleitung, für Links, die nicht als QR-Code laufen.

| Slug | Beschreibung | Kurz-URL (QR-Code oder Link) | Fertiger UTM-Link | QR-Datei |
| --- | --- | --- | --- | --- |
| `flyer` | QR-Code auf den Flyern. | `https://straussifestival.de/q/flyer` | `https://straussifestival.de/?utm_source=flyer&utm_medium=scan&utm_campaign=straussi-festival-2027` | [flyer.svg](qr/flyer.svg) |
| `plakat` | QR-Code auf den Plakaten bzw. Aushängen. | `https://straussifestival.de/q/plakat` | `https://straussifestival.de/?utm_source=plakat&utm_medium=scan&utm_campaign=straussi-festival-2027` | [plakat.svg](qr/plakat.svg) |
| `sticker` | QR-Code auf den Stickern. | `https://straussifestival.de/q/sticker` | `https://straussifestival.de/?utm_source=sticker&utm_medium=scan&utm_campaign=straussi-festival-2027` | [sticker.svg](qr/sticker.svg) |
| `whatsapp` | Link, der in WhatsApp-Gruppen und -Kanälen geteilt wird. Immer diesen Link teilen, nie nur die Domain. | `https://straussifestival.de/q/whatsapp` | `https://straussifestival.de/?utm_source=whatsapp&utm_medium=messenger&utm_campaign=straussi-festival-2027` | kein QR-Code (Link teilen) |
| `instagram` | Link in der Instagram-Bio bzw. in Stories. | `https://straussifestival.de/q/instagram` | `https://straussifestival.de/?utm_source=instagram&utm_medium=social&utm_campaign=straussi-festival-2027` | kein QR-Code (Link teilen) |
| `tiktok` | Link in der TikTok-Bio. | `https://straussifestival.de/q/tiktok` | `https://straussifestival.de/?utm_source=tiktok&utm_medium=social&utm_campaign=straussi-festival-2027` | kein QR-Code (Link teilen) |
| `rausgegangen` | Link auf Rausgegangen (Event-App/-Seite). | `https://straussifestival.de/q/rausgegangen` | `https://straussifestival.de/?utm_source=rausgegangen&utm_medium=plattform&utm_campaign=straussi-festival-2027` | kein QR-Code (Link teilen) |
| `studentenpartys-stuttgart` | Link bei Studentenpartys Stuttgart. | `https://straussifestival.de/q/studentenpartys-stuttgart` | `https://straussifestival.de/?utm_source=studentenpartys-stuttgart&utm_medium=plattform&utm_campaign=straussi-festival-2027` | kein QR-Code (Link teilen) |
| `kattafest` | QR-Code auf dem Kattafest von Straussi 1 (Aufsteller, Flyer, Plakat am Stand, Leinwand). | `https://straussifestival.de/q/kattafest` | `https://straussifestival.de/?utm_source=kattafest-str1&utm_medium=scan&utm_campaign=straussi-festival-2027` | [kattafest.svg](qr/kattafest.svg) |
| `winterfest` | QR-Code auf dem Winterfest von Straussi 3 (Aufsteller, Flyer, Plakat am Stand, Leinwand). | `https://straussifestival.de/q/winterfest` | `https://straussifestival.de/?utm_source=winterfest-str3&utm_medium=scan&utm_campaign=straussi-festival-2027` | [winterfest.svg](qr/winterfest.svg) |
| `halloween` | QR-Code auf der Halloween-Party von Straussi 1 (Aufsteller, Flyer, Plakat am Stand, Leinwand). | `https://straussifestival.de/q/halloween` | `https://straussifestival.de/?utm_source=halloween-str1&utm_medium=scan&utm_campaign=straussi-festival-2027` | [halloween.svg](qr/halloween.svg) |
| `festivalwuba` | QR-Code für Festivalwuba (Straussi 1). | `https://straussifestival.de/q/festivalwuba` | `https://straussifestival.de/?utm_source=festivalwuba-str1&utm_medium=scan&utm_campaign=straussi-festival-2027` | [festivalwuba.svg](qr/festivalwuba.svg) |
| `wuba` | QR-Code für Wuba (Straussi 1). | `https://straussifestival.de/q/wuba` | `https://straussifestival.de/?utm_source=wuba-str1&utm_medium=scan&utm_campaign=straussi-festival-2027` | [wuba.svg](qr/wuba.svg) |
| `maschinenbau` | QR-Code auf dem Maschinenbauerfest (vor allem zur Instagram-Weiterleitung /redirect-instagram/q/maschinenbau). | `https://straussifestival.de/q/maschinenbau` | `https://straussifestival.de/?utm_source=maschinenbau&utm_medium=scan&utm_campaign=straussi-festival-2027` | [maschinenbau.svg](qr/maschinenbau.svg) |

## Auf eine Unterseite zeigen

Jeder Kanal funktioniert hinter **jeder** Seite: einfach `/q/<slug>` an den Seitenpfad
hängen. Die UTM-Parameter sind dabei immer dieselben, nur die Seite ändert sich.

```
https://straussifestival.de/q/flyer           ->  Startseite
https://straussifestival.de/lineup/q/flyer    ->  Line-up-Seite
```

Die passenden QR-Codes (nur gedruckte Kanäle, `utm_medium` `scan`) liegen fertig im Ordner `qr/` bereit:

| Seite | QR-Codes |
| --- | --- |
| `/` | [qr/](qr/) |
| `/anfahrt/` | [qr/anfahrt/](qr/anfahrt/) |
| `/bewohner/` | [qr/bewohner/](qr/bewohner/) |
| `/datenschutz/` | [qr/datenschutz/](qr/datenschutz/) |
| `/faq/` | [qr/faq/](qr/faq/) |
| `/impressum/` | [qr/impressum/](qr/impressum/) |
| `/infos/` | [qr/infos/](qr/infos/) |
| `/lineup/` | [qr/lineup/](qr/lineup/) |
| `/redirect-instagram/` (führt direkt zu Instagram) | [qr/redirect-instagram/](qr/redirect-instagram/) |
| `/redirect-ticket/` | [qr/redirect-ticket/](qr/redirect-ticket/) |
