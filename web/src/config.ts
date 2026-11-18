/**
 * Central configuration of the website.
 * Everything that may change (ticket link, switches, key facts) lives here.
 * Page texts do NOT live here, but directly in the files under src/pages/ (e.g. infos.astro).
 */

const shortName = 'Straussi Festival';
const year = '2027';

export const festival = {
  shortName,
  year,
  name: `${shortName} ${year}`,
  organizer: 'Team aus Bewohner*innen des Straussi 1, 2 & 3',
  location: 'Studierendenwohnheime Straussi, Stuttgart',
  dateText: '11.06.–12.06.2027',
  /** Contact address of the festival team (footer and imprint). */
  email: 'info@straussifestival.de',
  /** For applications from bands, DJs and other artists (footer, FAQ). */
  emailActs: 'acts@straussifestival.de',
  /** For sponsoring requests (footer). */
  emailSponsoring: 'sponsorings@straussifestival.de',
  /**
   * Target time for the countdown on the home page (ISO with time zone).
   * Deliberately midnight as a simple placeholder as long as no more precise
   * start time is fixed. Change at any time once there is a real time.
   */
  startTime: '2027-06-11T00:00:00+02:00',
  /** Address of the festival grounds (map on the directions page and calendar entry). */
  address: 'Universitätsstraße 94, 70569 Stuttgart',
};

/**
 * Calendar entry to take away (button "In den Kalender", components/CalendarButton.astro,
 * file /kalender.ics from pages/kalender.ics.ts). Deliberately all-day as long as there are
 * no times. Format YYYY-MM-DD, lastDay is the last festival day (inclusive).
 */
export const calendar = {
  firstDay: '2027-06-11',
  lastDay: '2027-06-12',
};

/**
 * Start and end of the calendar entry in calendar format YYYYMMDD. For all-day
 * events the end is, by the standard, the day AFTER the last day. Do not change by hand.
 */
export function calendarDays() {
  const end = new Date(`${calendar.lastDay}T12:00:00Z`);
  end.setUTCDate(end.getUTCDate() + 1);
  const format = (date: string) => date.slice(0, 10).replaceAll('-', '');
  return { start: format(calendar.firstDay), end: format(end.toISOString()) };
}

/**
 * Map on the directions page (components/LocationMap.astro). The image is our own file
 * (excerpt from OpenStreetMap, see public/anfahrt/README.md); nothing is loaded from
 * third-party servers. The buttons open the address in the phone's map app.
 */
export const locationMap = {
  image: '/anfahrt/karte.webp',
  width: 800,
  height: 600,
  /** Coordinates of the marker (centre of the residences), for the OpenStreetMap link. */
  latitude: 48.74276,
  longitude: 9.10169,
};

/**
 * Our own photos for the background collage of the hero screen (three tall image columns,
 * hence portrait format). Put the file in web/public/wohnheime/ and add it here, see the README there.
 * No photos with visible sponsors (logos, umbrellas, bottles).
 */
export const heroImages: { image: string; alt: string }[] = [
  { image: '/wohnheime/party-1.jpg', alt: 'Bühne mit blauen Lasern über einer feiernden Menge im Innenhof' },
  { image: '/wohnheime/party-2.jpg', alt: 'Große Strauß-Figur mit ausgebreiteten Flügeln, pink und lila beleuchtet im Nebel' },
  { image: '/wohnheime/party-3.jpg', alt: 'Band auf der Bühne, davor ein Publikum mit erhobenen Händen' },
];

export const ticket = {
  // Ticket shop at dein-ticket.shop (the festival's event page).
  url: 'https://straussifestival.dein-ticket.shop/events/straussifestival-111/straussifestival-111',

  /**
   * Appends the visit's UTM parameters to the ticket link, so the ticket shop
   * sees which channel a purchase came from (components/UtmForwarding.astro,
   * info for the shop: docs/TICKETSHOP-UTM.md). Without consent in the cookie banner
   * only from the landing page, with consent for the whole visit.
   */
  forwardUtm: true,
} as const;

/**
 * Ticket buttons are only clickable if a real URL is set above. As long as it
 * still says TODO, they appear greyed out without a link (see TicketButton.astro).
 */
export const ticketActive = !ticket.url.includes('TODO');

/**
 * Instagram section on the home page ("Bleib auf dem Laufenden").
 * Without the widget (below) nothing is embedded from Instagram, only linked; the
 * tile photos are our own files. With the widget the feed only loads after consent.
 * profileUrl is also the target of the redirect /redirect-instagram/ (QR codes to Instagram).
 */
export const instagram = {
  profileUrl: 'https://www.instagram.com/straussifestival/',
  name: '@straussifestival',
  /**
   * Our own photos for the tiles (portrait, approx. 3:4). Put the file in web/public/insta/ and add it here:
   *   { image: '/insta/foto-1.jpg', alt: 'Short description of the photo' }
   * As long as fewer than 5 are listed, placeholders fill the free spots.
   */
  photos: [] as { image: string; alt: string }[],

  /**
   * Real Instagram feed via the free LightWidget widget (decided,
   * no view limit), instructions in web/public/insta/README.md.
   *
   * - url: the address from the provider's iframe embed code (whatever is in src="...").
   * - provider: name of the provider; shown in the cookie banner and must go into the privacy policy.
   * - height: height of the feed in pixels (adjust to the number of rows in the widget).
   *
   * As long as url is empty, there is neither a feed nor a cookie banner, and the tiles above stay.
   * If url is set, the feed loads ONLY after consent in the cookie banner (the tiles before that).
   */
  widget: {
    // Widget c038160329c25bac8724aca37ea5ea03 created, but the free version of LightWidget has no HTTPS
    // (only shows an upgrade notice). Only fill in once HTTPS is included in the plan.
    url: '', // TODO: https://lightwidget.com/widgets/c038160329c25bac8724aca37ea5ea03.html after upgrade
    provider: 'LightWidget',
    height: 420,
  },
};

/**
 * TikTok profile, only linked like Instagram (no embedded video/widget).
 */
export const tiktok = {
  profileUrl: 'https://www.tiktok.com/@straussifestival',
  name: '@straussifestival',
};

/**
 * Matomo tracking (self-hosted on the web hosting, stats.<domain>).
 * Address and site ID come from environment variables (web/.env, see
 * web/.env.example). If either value is missing, Matomo is not
 * included and the site still works.
 *
 * Matomo counts without cookies. Only after "Akzeptieren" in the cookie banner does
 * it set cookies and then also recognises visitors across several days.
 */
export const analytics = {
  /** e.g. "https://stats.example.org", without a trailing slash */
  url: (import.meta.env.PUBLIC_MATOMO_URL ?? '').trim().replace(/\/+$/, ''),
  siteId: (import.meta.env.PUBLIC_MATOMO_SITE_ID ?? '').trim(),
  /**
   * Event on a click on the ticket button: category and action; the name is the
   * position (header, hero, footer, or text for TicketLink in body text). In Matomo the goal "Ticketklick"
   * is tied to this category (see deploy/README.md).
   */
  ticketCategory: 'Ticket',
  ticketAction: 'Klick',
  /** Action of the redirect /redirect-ticket/ (links from third-party sites straight to the shop). */
  ticketRedirectAction: 'Weiterleitung',
  /** Event of the redirect /redirect-instagram/ (QR codes straight to Instagram). */
  instaCategory: 'Instagram',
  instaAction: 'Weiterleitung',
  /** Click on "In den Kalender": category and action; the name is the kind (google, ics). */
  calendarCategory: 'Kalender',
  calendarAction: 'Eintrag',
};

export const analyticsActive = Boolean(analytics.url && analytics.siteId);

/**
 * The cookie banner appears as soon as there is something to consent to: Matomo cookies
 * (statistics), the Instagram feed, or remembering the channel for the ticket shop
 * (ticket.forwardUtm). One answer applies to everything.
 */
export const bannerActive = analyticsActive || Boolean(instagram.widget.url) || ticket.forwardUtm;
