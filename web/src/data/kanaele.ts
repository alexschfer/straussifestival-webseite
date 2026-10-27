/**
 * Einzige Datenquelle für alle Marketingkanäle.
 *
 * Aus dieser Liste werden beim Build automatisch erzeugt:
 *   1. Weiterleitungen  <seite>/q/<slug>  ->  <seite>?utm_...  (astro.config.ts)
 *   2. QR-Codes         docs/qr/<slug>.svg          (integrations/kanaele-output.ts, nur utm_medium "scan")
 *   3. Kanaltabelle     docs/kanaele.md             (integrations/kanaele-output.ts)
 *
 * "<seite>" ist dabei jede Seite der Webseite: /q/mensa landet auf der
 * Startseite, /lineup/q/mensa auf der Line-up-Seite, /infos/q/mensa auf den
 * Infos. Das gilt automatisch für jede Seite unter src/pages/, ein Kanal muss
 * dafür nichts extra eingetragen bekommen. Die UTM-Parameter sind überall
 * dieselben, nur die Zielseite unterscheidet sich.
 *
 * Neuen Kanal anlegen = einen Eintrag unten ergänzen, sonst nichts.
 *
 * Schreibregel für alle UTM-Werte und den Slug (wird beim Build geprüft):
 * nur Kleinbuchstaben a-z und Ziffern, keine Umlaute, kein ß, keine
 * Leerzeichen, mehrere Wörter mit Bindestrich: "plakat-mensa".
 */

export interface Kanal {
  /** Kurzname für die URL: /q/<slug>. Muss eindeutig sein. */
  slug: string;
  /** Woher kommt der Besucher? z. B. "flyer", "instagram" */
  utm_source: string;
  /** Art des Kanals: "scan" (gedruckter QR-Code), "messenger", "social" */
  utm_medium: string;
  /** Optional: Variante innerhalb der Quelle, z. B. "wohnheim-a" */
  utm_content?: string;
  /** Freitext für das Team, erscheint in docs/kanaele.md */
  beschreibung: string;
}

/** utm_campaign ist für alle Kanäle gleich. */
export const CAMPAIGN = 'straussi-festival-2027';

/** Pfadabschnitt der Weiterleitungen, also <seite>/q/<slug>. */
export const REDIRECT_SEGMENT = 'q';

export const kanaele: Kanal[] = [
  {
    slug: 'flyer',
    utm_source: 'flyer',
    utm_medium: 'scan',
    beschreibung: 'QR-Code auf den Flyern.',
  },
  {
    slug: 'plakat',
    utm_source: 'plakat',
    utm_medium: 'scan',
    beschreibung: 'QR-Code auf den Plakaten bzw. Aushängen.',
  },
  {
    slug: 'sticker',
    utm_source: 'sticker',
    utm_medium: 'scan',
    beschreibung: 'QR-Code auf den Stickern.',
  },
  // Feste in den Wohnheimen: eigener QR-Code pro Fest (z. B. auf einem Aufsteller,
  // Plakat am Stand oder der Leinwand), damit man sieht, wer über das Fest kam.
  // Normale Flyer, die dort verteilt werden, zählen weiter als "flyer".
  //
  // Wirbt ein Fest über mehrere Wege (eigene Flyer, WhatsApp-Gruppen), bekommt
  // jeder Weg einen eigenen Eintrag: utm_source ist immer das Fest, utm_medium
  // wie üblich "scan" oder "messenger", utm_content sagt, welcher Weg genau.
  {
    slug: 'kattafest',
    utm_source: 'kattafest',
    utm_medium: 'scan',
    utm_content: 'vor-ort',
    beschreibung: 'QR-Code auf dem Kattafest von Straußi 1 (Aufsteller, Plakat am Stand, Leinwand).',
  },
  {
    slug: 'kattafest-flyer',
    utm_source: 'kattafest',
    utm_medium: 'scan',
    utm_content: 'flyer',
    beschreibung: 'QR-Code auf den Flyern, die für das Kattafest von Straußi 1 gedruckt werden.',
  },
  {
    slug: 'kattafest-whatsapp',
    utm_source: 'kattafest',
    utm_medium: 'messenger',
    utm_content: 'whatsapp',
    beschreibung: 'Link für die WhatsApp-Gruppen zum Kattafest von Straußi 1. Immer diesen Link teilen, nie nur die Domain.',
  },
  {
    slug: 'winterfest',
    utm_source: 'winterfest',
    utm_medium: 'scan',
    beschreibung: 'QR-Code auf dem Winterfest von Straußi 3 (Aufsteller, Plakat am Stand, Leinwand).',
  },
  {
    slug: 'whatsapp',
    utm_source: 'whatsapp',
    utm_medium: 'messenger',
    beschreibung: 'Link, der in WhatsApp-Gruppen und -Kanälen geteilt wird. Immer diesen Link teilen, nie nur die Domain.',
  },
  {
    slug: 'instagram',
    utm_source: 'instagram',
    utm_medium: 'social',
    beschreibung: 'Link in der Instagram-Bio bzw. in Stories.',
  },
  {
    slug: 'tiktok',
    utm_source: 'tiktok',
    utm_medium: 'social',
    beschreibung: 'Link in der TikTok-Bio.',
  },
];

// ---------------------------------------------------------------------------
// Validierung: läuft beim Laden dieser Datei und damit bei jedem Build/Dev-Start.
// ---------------------------------------------------------------------------

const ERLAUBT = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const REGEL =
  'Erlaubt sind nur Kleinbuchstaben a-z und Ziffern; Wörter mit Bindestrich trennen ' +
  '(keine Umlaute, kein ß, keine Leerzeichen, kein Unterstrich).';

export function validiereKanaele(liste: Kanal[]): void {
  const fehler: string[] = [];
  const slugs = new Set<string>();

  const pruefe = (kanal: string, feld: string, wert: string | undefined, pflicht: boolean) => {
    if (wert === undefined) {
      if (pflicht) fehler.push(`Kanal "${kanal}": ${feld} fehlt.`);
      return;
    }
    if (!ERLAUBT.test(wert)) {
      fehler.push(`Kanal "${kanal}": ${feld} "${wert}" ist ungültig. ${REGEL}`);
    }
  };

  if (!ERLAUBT.test(CAMPAIGN)) {
    fehler.push(`CAMPAIGN "${CAMPAIGN}" ist ungültig. ${REGEL}`);
  }

  for (const k of liste) {
    pruefe(k.slug, 'slug', k.slug, true);
    pruefe(k.slug, 'utm_source', k.utm_source, true);
    pruefe(k.slug, 'utm_medium', k.utm_medium, true);
    pruefe(k.slug, 'utm_content', k.utm_content, false);
    if (!k.beschreibung.trim()) fehler.push(`Kanal "${k.slug}": beschreibung fehlt.`);
    if (slugs.has(k.slug)) fehler.push(`Slug "${k.slug}" kommt mehrfach vor.`);
    slugs.add(k.slug);
  }

  if (fehler.length > 0) {
    throw new Error(
      `Ungültige Kanaldaten in web/src/data/kanaele.ts:\n - ${fehler.join('\n - ')}`,
    );
  }
}

validiereKanaele(kanaele);

// ---------------------------------------------------------------------------
// Abgeleitete Werte
// ---------------------------------------------------------------------------

/** Query-String mit allen UTM-Parametern, ohne führendes "?". */
export function utmQuery(kanal: Kanal): string {
  const params = new URLSearchParams({
    utm_source: kanal.utm_source,
    utm_medium: kanal.utm_medium,
    utm_campaign: CAMPAIGN,
  });
  if (kanal.utm_content) params.set('utm_content', kanal.utm_content);
  return params.toString();
}

/**
 * Pfad der Kurz-URL, z. B. "/q/flyer" oder "/lineup/q/flyer".
 * "seite" ist ein Seitenpfad mit Schrägstrich am Anfang und Ende ("/" = Startseite).
 */
export function kurzPfad(kanal: Kanal, seite = '/'): string {
  return `${seite}${REDIRECT_SEGMENT}/${kanal.slug}`;
}

/** Weiterleitungsziel relativ zur Domain, z. B. "/lineup/?utm_source=flyer&...". */
export function zielPfad(kanal: Kanal, seite = '/'): string {
  return `${seite}?${utmQuery(kanal)}`;
}

/**
 * Fertige Map für die redirects-Option in astro.config: jede Seite mal jeden Kanal.
 * Die Seitenliste kommt aus integrations/seiten.ts (alle Dateien in src/pages/).
 */
export function kanalRedirects(seiten: string[] = ['/']): Record<string, string> {
  const paare = seiten.flatMap((seite) =>
    kanaele.map((k) => [kurzPfad(k, seite), zielPfad(k, seite)] as const),
  );
  return Object.fromEntries(paare);
}
