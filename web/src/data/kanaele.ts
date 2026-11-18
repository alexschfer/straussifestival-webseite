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
 * Ausnahme "ziel": Ein Kanal mit ziel: 'instagram' (bzw. 'ticket') führt mit /q/<slug>
 * nicht auf die Startseite, sondern über die gezählte Weiterleitung /redirect-instagram/
 * (bzw. /redirect-ticket/) direkt zu Instagram (bzw. zum Ticketshop). <seite>/q/<slug>
 * hinter einer anderen Seite führt weiterhin auf diese Seite.
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
  /** Art des Kanals: "scan" (gedruckter QR-Code), "messenger", "social", "plattform" (fremde Event-Seiten) */
  utm_medium: string;
  /** Optional: Variante innerhalb der Quelle, z. B. "wohnheim-a" */
  utm_content?: string;
  /** Freitext für das Team, erscheint in docs/kanaele.md */
  beschreibung: string;
  /**
   * Optional: frühere Slugs, die schon auf gedruckten QR-Codes stehen. Sie leiten
   * weiter auf diesen Kanal (gleiche UTM-Werte), damit alte Codes nicht ins Leere
   * führen. Für sie werden keine neuen QR-Codes erzeugt.
   */
  alteSlugs?: string[];
  /**
   * Optional: Wohin führt /q/<slug>? Ohne Angabe auf die Startseite (Normalfall).
   * 'instagram': über /redirect-instagram/ (zählt in Matomo, dann weiter zu Instagram).
   * 'ticket': über /redirect-ticket/ (zählt, dann weiter zum Ticketshop).
   * Betrifft nur /q/<slug>, nicht <seite>/q/<slug> hinter anderen Seiten.
   */
  ziel?: keyof typeof WEITERLEITUNGSSEITEN;
}

/** Seiten, auf die ein Kanal mit "ziel" statt auf die Startseite führt. */
export const WEITERLEITUNGSSEITEN = {
  instagram: '/redirect-instagram/',
  ticket: '/redirect-ticket/',
} as const;

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
    // Seit 18.11.2026 zu Instagram statt zur Startseite (Wunsch des Teams). Der gedruckte
    // Code bleibt gültig, nur das Ziel hat sich geändert. In Matomo zählen Sticker-Scans
    // seitdem als Ereignis Instagram / Weiterleitung, nicht mehr als Startseiten-Besuch.
    ziel: 'instagram',
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
  // Fremde Event-Plattformen und Partner, die auf uns verlinken (utm_medium "plattform").
  // Kein QR-Code, der Link wird dort eingetragen; deshalb Slug ausgeschrieben.
  {
    slug: 'rausgegangen',
    utm_source: 'rausgegangen',
    utm_medium: 'plattform',
    beschreibung: 'Link auf Rausgegangen (Event-App/-Seite).',
  },
  {
    slug: 'studentenpartys-stuttgart',
    utm_source: 'studentenpartys-stuttgart',
    utm_medium: 'plattform',
    beschreibung: 'Link bei Studentenpartys Stuttgart.',
  },
  // Feste in den Wohnheimen: eigener QR-Code pro Fest (z. B. auf einem Aufsteller,
  // Plakat am Stand oder der Leinwand), damit man sieht, wer über das Fest kam.
  // Normale Flyer, die dort verteilt werden, zählen weiter als "flyer".
  // Ein QR-Code pro Fest für alles Gedruckte dort. Der Link (slug) ist kurz, nur das Fest;
  // die Quelle (utm_source) behält das Wohnheim-Kürzel (-str1, -str3), damit man in der
  // Auswertung sieht, welches Wohnheim. Schon gedruckte alte Links stehen in alteSlugs.
  {
    slug: 'kattafest',
    utm_source: 'kattafest-str1',
    utm_medium: 'scan',
    beschreibung: 'QR-Code auf dem Kattafest von Straussi 1 (Aufsteller, Flyer, Plakat am Stand, Leinwand).',
  },
  {
    slug: 'winterfest',
    utm_source: 'winterfest-str3',
    utm_medium: 'scan',
    beschreibung: 'QR-Code auf dem Winterfest von Straussi 3 (Aufsteller, Flyer, Plakat am Stand, Leinwand).',
  },
  {
    slug: 'halloween',
    alteSlugs: ['halloween-str1'],
    utm_source: 'halloween-str1',
    utm_medium: 'scan',
    beschreibung: 'QR-Code auf der Halloween-Party von Straussi 1 (Aufsteller, Flyer, Plakat am Stand, Leinwand).',
  },
  {
    slug: 'festivalwuba',
    utm_source: 'festivalwuba-str1',
    utm_medium: 'scan',
    beschreibung: 'QR-Code für Festivalwuba (Straussi 1).',
  },
  {
    slug: 'wuba',
    utm_source: 'wuba-str1',
    utm_medium: 'scan',
    beschreibung: 'QR-Code für Wuba (Straussi 1).',
  },
  {
    // Link mit Wohnheim-Kürzel, so vom Auftraggeber gewünscht (abweichend vom Muster oben).
    slug: 'blockparty-str2',
    utm_source: 'blockparty-str2',
    utm_medium: 'scan',
    beschreibung: 'QR-Code auf der Blockparty von Straussi 2 (zur Instagram-Weiterleitung /redirect-instagram/q/blockparty-str2).',
  },
  {
    slug: 'netthier',
    utm_source: 'netthier',
    utm_medium: 'scan',
    beschreibung: 'QR-Code für Netthier (zur Instagram-Weiterleitung /redirect-instagram/q/netthier).',
  },
  // Fest außerhalb der Wohnheime: Name ohne Wohnheim-Kürzel.
  {
    slug: 'maschinenbau',
    utm_source: 'maschinenbau',
    utm_medium: 'scan',
    beschreibung: 'QR-Code auf dem Maschinenbauerfest (vor allem zur Instagram-Weiterleitung /redirect-instagram/q/maschinenbau).',
  },
];

/**
 * Fremde Quellen: Manche Plattformen hängen selbst UTM-Parameter an Links, z. B.
 * Instagram an den Bio-Link "utm_source=ig&utm_medium=social&utm_content=link_in_bio"
 * (in Matomo beobachtet, Oktober 2026). Der Webserver leitet solche Aufrufe auf
 * dieselbe Seite mit den Werten unseres Kanals um, damit in Matomo nur eine Zeile
 * pro Plattform steht. Links: utm_source der Plattform, rechts: Slug unseres Kanals.
 *
 * TikTok hängt laut Recherche (Oktober 2026) an Bio-Links nichts an, nur an
 * bezahlte Anzeigen. Deshalb kein Eintrag. Am besten trotzdem überall die
 * Kurz-URL /q/<slug> verwenden, die ignoriert fremde Parameter ohnehin.
 */
export const fremdeQuellen: Record<string, string> = {
  ig: 'instagram',
};

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
  // Alte Slugs erst nach allen aktuellen prüfen, damit auch Kollisionen mit später
  // folgenden Kanälen auffallen.
  for (const k of liste) {
    for (const alt of k.alteSlugs ?? []) {
      pruefe(k.slug, 'alteSlugs', alt, true);
      if (slugs.has(alt)) fehler.push(`Slug "${alt}" (alteSlugs von "${k.slug}") kommt mehrfach vor.`);
      slugs.add(alt);
    }
  }

  for (const [fremd, slug] of Object.entries(fremdeQuellen)) {
    pruefe(`fremdeQuellen.${fremd}`, 'utm_source', fremd, true);
    if (!slugs.has(slug)) fehler.push(`fremdeQuellen: Kanal "${slug}" (für "${fremd}") gibt es nicht.`);
    if (liste.some((k) => k.utm_source === fremd)) {
      fehler.push(`fremdeQuellen: "${fremd}" ist schon utm_source eines eigenen Kanals.`);
    }
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

/**
 * Weiterleitungsziel relativ zur Domain, z. B. "/lineup/?utm_source=flyer&...".
 * Bei /q/<slug> (Startseite) und gesetztem "ziel" stattdessen die Weiterleitungsseite,
 * z. B. "/redirect-instagram/?utm_source=sticker&...".
 */
export function zielPfad(kanal: Kanal, seite = '/'): string {
  const ziel = seite === '/' && kanal.ziel ? WEITERLEITUNGSSEITEN[kanal.ziel] : seite;
  return `${ziel}?${utmQuery(kanal)}`;
}

/**
 * Fertige Map für die redirects-Option in astro.config: jede Seite mal jeden Kanal.
 * Die Seitenliste kommt aus integrations/seiten.ts (alle Dateien in src/pages/).
 */
export function kanalRedirects(seiten: string[] = ['/']): Record<string, string> {
  // Aktuelle Slugs und frühere Slugs (alteSlugs) führen auf dasselbe Ziel.
  const paare = seiten.flatMap((seite) =>
    kanaele.flatMap((k) =>
      [k.slug, ...(k.alteSlugs ?? [])].map(
        (slug) => [kurzPfad({ ...k, slug }, seite), zielPfad(k, seite)] as const,
      ),
    ),
  );
  return Object.fromEntries(paare);
}
