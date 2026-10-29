# UTM-Tracking: Infos für den Ticketshop (dein-ticket.shop)

Kurzfassung für die Einrichtung im Shop-Backend. Stand: 29.10.2026.

## Worum es geht

Unsere Webseite **straussifestival.de** verlinkt auf den Shop:
`https://straussifestival.dein-ticket.shop/events/straussifestival-111/straussifestival-111`

Wir wollen wissen, **über welchen Werbeweg die Käufer kommen** (Flyer, Plakat, Sticker, WhatsApp, Instagram …). Dafür hängen wir an den Ticketlink die **UTM-Parameter** an, mit denen der Besucher auf unsere Seite kam. Beispiel:

```
https://straussifestival.dein-ticket.shop/events/straussifestival-111/straussifestival-111?utm_source=flyer&utm_medium=scan&utm_campaign=straussi-festival-2027
```

**Bitte im Shop:** diese Parameter beim Kauf mitspeichern und Verkäufe/Tickets **nach `utm_source` und `utm_medium` auswertbar** machen (Bericht oder Export).

## Die Werte

**`utm_campaign`** ist immer: `straussi-festival-2027`

**`utm_medium`** (Art des Werbewegs):

| Wert | Bedeutung |
| --- | --- |
| `scan` | gedruckter QR-Code gescannt |
| `messenger` | Link aus WhatsApp |
| `social` | Link aus Instagram- oder TikTok-Bio/Story |

**`utm_source`** (konkreter Werbeweg):

| `utm_source` | `utm_medium` | Werbeweg |
| --- | --- | --- |
| `flyer` | `scan` | QR-Code auf Flyern |
| `plakat` | `scan` | QR-Code auf Plakaten/Aushängen |
| `sticker` | `scan` | QR-Code auf Stickern |
| `kattafest-str1` | `scan` | QR-Code auf dem Kattafest (Straussi 1) |
| `winterfest-str3` | `scan` | QR-Code auf dem Winterfest (Straussi 3) |
| `halloween-str1` | `scan` | QR-Code auf der Halloween-Party (Straussi 1) |
| `whatsapp` | `messenger` | Link in WhatsApp-Gruppen/-Kanälen |
| `instagram` | `social` | Link in Instagram-Bio/Stories |
| `tiktok` | `social` | Link in TikTok-Bio |

`utm_content` ist derzeit nicht in Gebrauch, kann aber später für Varianten dazukommen. Bitte gegebenenfalls mitspeichern.

**Schreibweise:** immer klein, nur `a–z`, `0–9` und Bindestrich, keine Umlaute. Neue Werbewege können jederzeit dazukommen, gleiches Schema. Bitte also **beliebige Werte annehmen**, keine feste Liste hinterlegen.

**Sonderfall Instagram:** Instagram hängt an Links teils selbst `utm_source=ig` an. Auf unserer Seite schreiben wir das auf `instagram` um. Falls bei euch direkt `ig` ankommt (z. B. Shop-Link direkt in Instagram geteilt), bitte wie `instagram` werten.

## Gut zu wissen

- **Ohne UTM-Parameter** (Direktaufruf des Shops oder Besucher ohne Werbeweg) kommt der Link ohne Parameter an. Bitte als „direkt/unbekannt“ werten.
- **Einschränkung:** Die Parameter gehen nur mit, wenn der Besucher auf der Seite, auf der er gelandet ist, auf „Tickets kaufen“ klickt. Wechselt er vorher auf eine Unterseite, kommt der Klick ohne Parameter an. Unsere eigene Statistik (Matomo) ordnet auch diese Klicks zu. Die Zahlen im Shop sind also eher eine Untergrenze.
- Wir übergeben **keine personenbezogenen Daten**, nur diese Werbeweg-Kennungen.
- Das Anhängen ist bei uns aktuell **noch ausgeschaltet** und wird eingeschaltet, sobald ihr bestätigt, dass der Shop die Parameter speichert.

**Ansprechpartner:** orga@straussifestival.de
