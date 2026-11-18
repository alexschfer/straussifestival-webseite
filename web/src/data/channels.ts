/**
 * Single source of truth for all marketing channels.
 *
 * The following are generated automatically from this list at build time:
 *   1. Redirects       <page>/q/<slug>  ->  <page>?utm_...  (astro.config.ts)
 *   2. QR codes        docs/qr/<slug>.svg          (integrations/channels-output.ts, only utm_medium "scan")
 *   3. Channel table   docs/channels.md            (integrations/channels-output.ts)
 *
 * "<page>" is any page of the website: /q/mensa lands on the home page,
 * /lineup/q/mensa on the line-up page, /infos/q/mensa on the info page.
 * This applies automatically to every page under src/pages/; a channel does not
 * need any extra entry for it. The UTM parameters are the same everywhere,
 * only the target page differs.
 *
 * Exception "target": a channel with target: 'instagram' (or 'ticket') does not lead
 * from /q/<slug> to the home page, but via the counted redirect /redirect-instagram/
 * (or /redirect-ticket/) straight to Instagram (or the ticket shop). <page>/q/<slug>
 * behind another page still leads to that page.
 *
 * Adding a new channel = add an entry below, nothing else.
 *
 * Spelling rule for all UTM values and the slug (checked at build time):
 * only lowercase letters a-z and digits, no umlauts, no ß, no
 * spaces, multiple words joined with a hyphen: "plakat-mensa".
 */

export interface Channel {
  /** Short name for the URL: /q/<slug>. Must be unique. */
  slug: string;
  /** Where does the visitor come from? e.g. "flyer", "instagram" */
  utm_source: string;
  /** Kind of channel: "scan" (printed QR code), "messenger", "social", "plattform" (third-party event sites) */
  utm_medium: string;
  /** Optional: variant within the source, e.g. "wohnheim-a" */
  utm_content?: string;
  /** Free text for the team, shown in docs/channels.md */
  description: string;
  /**
   * Optional: earlier slugs that are already on printed QR codes. They redirect
   * to this channel (same UTM values), so old codes don't lead nowhere.
   * No new QR codes are generated for them.
   */
  oldSlugs?: string[];
  /**
   * Optional: where does /q/<slug> lead? If not set, to the home page (normal case).
   * 'instagram': via /redirect-instagram/ (counts in Matomo, then on to Instagram).
   * 'ticket': via /redirect-ticket/ (counts, then on to the ticket shop).
   * Only affects /q/<slug>, not <page>/q/<slug> behind other pages.
   */
  target?: keyof typeof REDIRECT_PAGES;
}

/** Pages that a channel with "target" leads to instead of the home page. */
export const REDIRECT_PAGES = {
  instagram: '/redirect-instagram/',
  ticket: '/redirect-ticket/',
} as const;

/** utm_campaign is the same for all channels. */
export const CAMPAIGN = 'straussi-festival-2027';

/** Path segment of the redirects, i.e. <page>/q/<slug>. */
export const REDIRECT_SEGMENT = 'q';

export const channels: Channel[] = [
  {
    slug: 'flyer',
    utm_source: 'flyer',
    utm_medium: 'scan',
    description: 'QR-Code auf den Flyern.',
  },
  {
    slug: 'plakat',
    utm_source: 'plakat',
    utm_medium: 'scan',
    description: 'QR-Code auf den Plakaten bzw. Aushängen.',
  },
  {
    slug: 'sticker',
    utm_source: 'sticker',
    utm_medium: 'scan',
    description: 'QR-Code auf den Stickern.',
    // Since 2026-11-18 leads to Instagram instead of the home page (team's wish). The printed
    // code stays valid, only the target has changed. In Matomo sticker scans have counted
    // as the event Instagram / Weiterleitung since then, no longer as a home page visit.
    target: 'instagram',
  },
  // Business card: two codes, one to the website, one (counted) to Instagram. Same
  // source, so the business card stays one channel in Matomo; utm_content tells the paths apart.
  {
    slug: 'visitenkarte',
    utm_source: 'visitenkarte',
    utm_medium: 'scan',
    description: 'QR-Code auf den Visitenkarten, führt zur Webseite.',
  },
  {
    slug: 'visitenkarte-insta',
    utm_source: 'visitenkarte',
    utm_medium: 'scan',
    utm_content: 'instagram',
    description: 'Zweiter QR-Code auf den Visitenkarten.',
    target: 'instagram',
  },
  {
    slug: 'whatsapp',
    utm_source: 'whatsapp',
    utm_medium: 'messenger',
    description: 'Link, der in WhatsApp-Gruppen und -Kanälen geteilt wird. Immer diesen Link teilen, nie nur die Domain.',
  },
  {
    slug: 'instagram',
    utm_source: 'instagram',
    utm_medium: 'social',
    description: 'Link in der Instagram-Bio bzw. in Stories.',
  },
  {
    slug: 'tiktok',
    utm_source: 'tiktok',
    utm_medium: 'social',
    description: 'Link in der TikTok-Bio.',
  },
  // Third-party event platforms and partners that link to us (utm_medium "plattform").
  // No QR code, the link is entered there; hence the slug is written out in full.
  {
    slug: 'rausgegangen',
    utm_source: 'rausgegangen',
    utm_medium: 'plattform',
    description: 'Link auf Rausgegangen (Event-App/-Seite).',
  },
  {
    slug: 'studentenpartys-stuttgart',
    utm_source: 'studentenpartys-stuttgart',
    utm_medium: 'plattform',
    description: 'Link bei Studentenpartys Stuttgart.',
  },
  // Parties in the residences: a QR code of its own per party (e.g. on a display stand,
  // poster at the booth or the screen), so you can see who came via the party.
  // Regular flyers handed out there still count as "flyer".
  // One QR code per party for everything printed there. The link (slug) is short, just the party;
  // the source (utm_source) keeps the residence suffix (-str1, -str3), so the analysis
  // shows which residence. Old links that were already printed are listed in oldSlugs.
  {
    slug: 'kattafest',
    utm_source: 'kattafest-str1',
    utm_medium: 'scan',
    description: 'QR-Code auf dem Kattafest von Straussi 1 (Aufsteller, Flyer, Plakat am Stand, Leinwand).',
  },
  {
    slug: 'winterfest',
    utm_source: 'winterfest-str3',
    utm_medium: 'scan',
    description: 'QR-Code auf dem Winterfest von Straussi 3 (Aufsteller, Flyer, Plakat am Stand, Leinwand).',
  },
  {
    slug: 'halloween',
    oldSlugs: ['halloween-str1'],
    utm_source: 'halloween-str1',
    utm_medium: 'scan',
    description: 'QR-Code auf der Halloween-Party von Straussi 1 (Aufsteller, Flyer, Plakat am Stand, Leinwand).',
  },
  {
    slug: 'festivalwuba',
    utm_source: 'festivalwuba-str1',
    utm_medium: 'scan',
    description: 'QR-Code für Festivalwuba (Straussi 1).',
  },
  {
    slug: 'wuba',
    utm_source: 'wuba-str1',
    utm_medium: 'scan',
    description: 'QR-Code für Wuba (Straussi 1).',
  },
  {
    // Link with residence suffix, as requested by the client (deviating from the pattern above).
    slug: 'blockparty-str2',
    utm_source: 'blockparty-str2',
    utm_medium: 'scan',
    description: 'QR-Code auf der Blockparty von Straussi 2. Auch /redirect-instagram/q/blockparty-str2 bleibt gültig.',
    // Since 2026-11-18 /q/blockparty-str2 also leads (counted) to Instagram.
    target: 'instagram',
  },
  {
    slug: 'netthier',
    utm_source: 'netthier',
    utm_medium: 'scan',
    description: 'QR-Code für Netthier. Auch /redirect-instagram/q/netthier bleibt gültig.',
    // Since 2026-11-18 /q/netthier also leads (counted) to Instagram.
    target: 'instagram',
  },
  // Party outside the residences: name without residence suffix.
  {
    slug: 'maschinenbau',
    utm_source: 'maschinenbau',
    utm_medium: 'scan',
    description: 'QR-Code auf dem Maschinenbauerfest. Auch /redirect-instagram/q/maschinenbau bleibt gültig.',
    // Since 2026-11-18 /q/maschinenbau also leads (counted) to Instagram.
    target: 'instagram',
  },
];

/**
 * Foreign sources: some platforms append UTM parameters to links themselves, e.g.
 * Instagram adds "utm_source=ig&utm_medium=social&utm_content=link_in_bio" to the bio link
 * (observed in Matomo, October 2026). The web server redirects such requests to
 * the same page with the values of our channel, so Matomo shows only one row
 * per platform. Left: the platform's utm_source, right: slug of our channel.
 *
 * According to research (October 2026) TikTok appends nothing to bio links, only to
 * paid ads. Hence no entry. Still best to use the short URL /q/<slug>
 * everywhere; it ignores foreign parameters anyway.
 */
export const foreignSources: Record<string, string> = {
  ig: 'instagram',
};

// ---------------------------------------------------------------------------
// Validation: runs when this file is loaded, i.e. on every build/dev start.
// ---------------------------------------------------------------------------

const ALLOWED = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const RULE =
  'Only lowercase letters a-z and digits are allowed; separate words with a hyphen ' +
  '(no umlauts, no ß, no spaces, no underscore).';

export function validateChannels(list: Channel[]): void {
  const errors: string[] = [];
  const slugs = new Set<string>();

  const check = (channel: string, field: string, value: string | undefined, required: boolean) => {
    if (value === undefined) {
      if (required) errors.push(`Channel "${channel}": ${field} is missing.`);
      return;
    }
    if (!ALLOWED.test(value)) {
      errors.push(`Channel "${channel}": ${field} "${value}" is invalid. ${RULE}`);
    }
  };

  if (!ALLOWED.test(CAMPAIGN)) {
    errors.push(`CAMPAIGN "${CAMPAIGN}" is invalid. ${RULE}`);
  }

  for (const c of list) {
    check(c.slug, 'slug', c.slug, true);
    check(c.slug, 'utm_source', c.utm_source, true);
    check(c.slug, 'utm_medium', c.utm_medium, true);
    check(c.slug, 'utm_content', c.utm_content, false);
    if (!c.description.trim()) errors.push(`Channel "${c.slug}": description is missing.`);
    if (slugs.has(c.slug)) errors.push(`Slug "${c.slug}" occurs more than once.`);
    slugs.add(c.slug);
  }
  // Check old slugs only after all current ones, so collisions with channels
  // further down are caught too.
  for (const c of list) {
    for (const old of c.oldSlugs ?? []) {
      check(c.slug, 'oldSlugs', old, true);
      if (slugs.has(old)) errors.push(`Slug "${old}" (oldSlugs of "${c.slug}") occurs more than once.`);
      slugs.add(old);
    }
  }

  for (const [foreign, slug] of Object.entries(foreignSources)) {
    check(`foreignSources.${foreign}`, 'utm_source', foreign, true);
    if (!slugs.has(slug)) errors.push(`foreignSources: channel "${slug}" (for "${foreign}") does not exist.`);
    if (list.some((c) => c.utm_source === foreign)) {
      errors.push(`foreignSources: "${foreign}" is already the utm_source of one of our own channels.`);
    }
  }

  if (errors.length > 0) {
    throw new Error(
      `Invalid channel data in web/src/data/channels.ts:\n - ${errors.join('\n - ')}`,
    );
  }
}

validateChannels(channels);

// ---------------------------------------------------------------------------
// Derived values
// ---------------------------------------------------------------------------

/** Query string with all UTM parameters, without a leading "?". */
export function utmQuery(channel: Channel): string {
  const params = new URLSearchParams({
    utm_source: channel.utm_source,
    utm_medium: channel.utm_medium,
    utm_campaign: CAMPAIGN,
  });
  if (channel.utm_content) params.set('utm_content', channel.utm_content);
  return params.toString();
}

/**
 * Path of the short URL, e.g. "/q/flyer" or "/lineup/q/flyer".
 * "page" is a page path with a slash at the start and end ("/" = home page).
 */
export function shortPath(channel: Channel, page = '/'): string {
  return `${page}${REDIRECT_SEGMENT}/${channel.slug}`;
}

/**
 * Redirect target relative to the domain, e.g. "/lineup/?utm_source=flyer&...".
 * For /q/<slug> (home page) with "target" set, the redirect page instead,
 * e.g. "/redirect-instagram/?utm_source=sticker&...".
 */
export function targetPath(channel: Channel, page = '/'): string {
  const target = page === '/' && channel.target ? REDIRECT_PAGES[channel.target] : page;
  return `${target}?${utmQuery(channel)}`;
}

/**
 * Ready-made map for the redirects option in astro.config: every page times every channel.
 * The page list comes from integrations/pages.ts (all files in src/pages/).
 */
export function channelRedirects(pages: string[] = ['/']): Record<string, string> {
  // Current slugs and earlier slugs (oldSlugs) lead to the same target.
  const pairs = pages.flatMap((page) =>
    channels.flatMap((c) =>
      [c.slug, ...(c.oldSlugs ?? [])].map(
        (slug) => [shortPath({ ...c, slug }, page), targetPath(c, page)] as const,
      ),
    ),
  );
  return Object.fromEntries(pairs);
}
