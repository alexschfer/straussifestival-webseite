/**
 * Einzige Datenquelle für alle Marketingkanäle.
 *
 * Aus dieser Liste werden beim Build automatisch erzeugt:
 *   1. Weiterleitungen  /q/<slug>  ->  /?utm_...   (astro.config.ts)
 *   2. QR-Codes         docs/qr/<slug>.svg          (integrations/kanaele-output.ts)
 *   3. Kanaltabelle     docs/kanaele.md             (integrations/kanaele-output.ts)
 *
 * Neuen Kanal anlegen = einen Eintrag unten ergänzen, sonst nichts.
 *
 * Schreibregel für alle UTM-Werte und den Slug (wird beim Build geprüft):
 * nur Kleinbuchstaben a-z und Ziffern, keine Umlaute, kein ß, keine
 * Leerzeichen, mehrere Wörter mit Bindestrich: "aushang-wohnheim-a".
 */

export interface Kanal {
  /** Kurzname für die URL: /q/<slug>. Muss eindeutig sein. */
  slug: string;
  /** Woher kommt der Besucher? z. B. "flyer", "instagram" */
  utm_source: string;
  /** Art des Kanals, z. B. "print", "social", "messenger" */
  utm_medium: string;
  /** Optional: Variante innerhalb der Quelle, z. B. "wohnheim-a" */
  utm_content?: string;
  /** Freitext für das Team, erscheint in docs/kanaele.md */
  beschreibung: string;
  /** true = Kanal ist noch nicht bestätigt, QR-Code noch nicht drucken */
  vorlaeufig: boolean;
}

/** utm_campaign ist für alle Kanäle gleich. */
export const CAMPAIGN = 'straussi-festival-2027';

/** Pfadpräfix der Weiterleitungen, also /q/<slug>. */
export const REDIRECT_PREFIX = '/q';

export const kanaele: Kanal[] = [
  {
    slug: 'flyer',
    utm_source: 'flyer',
    utm_medium: 'print',
    beschreibung: 'Flyer, die verteilt werden (allgemein).',
    vorlaeufig: true,
  },
  {
    slug: 'aushang-wohnheim-a',
    utm_source: 'aushang',
    utm_medium: 'print',
    utm_content: 'wohnheim-a',
    beschreibung: 'Aushang im Wohnheim A.',
    vorlaeufig: true,
  },
  {
    slug: 'aushang-wohnheim-b',
    utm_source: 'aushang',
    utm_medium: 'print',
    utm_content: 'wohnheim-b',
    beschreibung: 'Aushang im Wohnheim B.',
    vorlaeufig: true,
  },
  {
    slug: 'mensa',
    utm_source: 'mensa',
    utm_medium: 'print',
    beschreibung: 'Aushang bzw. Auslage in der Mensa.',
    vorlaeufig: true,
  },
  {
    slug: 'instagram',
    utm_source: 'instagram',
    utm_medium: 'social',
    beschreibung: 'Link im Instagram-Profil bzw. in Beiträgen.',
    vorlaeufig: true,
  },
  {
    slug: 'whatsapp',
    utm_source: 'whatsapp',
    utm_medium: 'messenger',
    beschreibung: 'Link, der in WhatsApp-Gruppen und -Kanälen geteilt wird.',
    vorlaeufig: true,
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

/** Pfad der Kurz-URL, z. B. "/q/flyer" (das steht im QR-Code). */
export function kurzPfad(kanal: Kanal): string {
  return `${REDIRECT_PREFIX}/${kanal.slug}`;
}

/** Weiterleitungsziel relativ zur Domain, z. B. "/?utm_source=flyer&...". */
export function zielPfad(kanal: Kanal): string {
  return `/?${utmQuery(kanal)}`;
}

/** Fertige Map für die redirects-Option in astro.config. */
export function kanalRedirects(): Record<string, string> {
  return Object.fromEntries(kanaele.map((k) => [kurzPfad(k), zielPfad(k)]));
}
