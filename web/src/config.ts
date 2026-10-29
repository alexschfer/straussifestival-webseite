/**
 * Zentrale Konfiguration der Webseite.
 * Alles, was sich ändern kann (Ticket-Link, Schalter, Eckdaten), steht hier.
 * Texte der Seiten stehen NICHT hier, sondern direkt in den Dateien unter src/pages/ (z. B. infos.astro).
 */

const kurzname = 'Straussi Festival';
const jahr = '2027';

export const festival = {
  kurzname,
  jahr,
  name: `${kurzname} ${jahr}`,
  veranstalter: 'Team aus Bewohner*innen des Straussi 1, 2 & 3',
  ort: 'Studierendenwohnheime Straußäcker, Stuttgart',
  datum: '11.06.–12.06.2027',
  /** Kontaktadresse des Festivalteams (Fußzeile und Impressum). */
  email: 'info@straussifestival.de',
  /**
   * Ziel-Zeitpunkt für den Countdown auf der Startseite (ISO mit Zeitzone).
   * Bewusst Mitternacht als einfacher Platzhalter, solange keine genauere
   * Startzeit feststeht. Jederzeit anpassbar, sobald es eine echte Uhrzeit gibt.
   */
  startZeitpunkt: '2027-06-11T00:00:00+02:00',
};

/**
 * Eigene Fotos für die Hintergrund-Collage im Startbildschirm (drei hohe Bildspalten,
 * deshalb Hochformat). Datei in web/public/wohnheime/ ablegen und hier eintragen, siehe README dort.
 * Keine Fotos mit sichtbaren Sponsoren (Logos, Schirme, Flaschen).
 */
export const startBilder: { bild: string; alt: string }[] = [
  { bild: '/wohnheime/party-1.jpg', alt: 'Bühne mit blauen Lasern über einer feiernden Menge im Innenhof' },
  { bild: '/wohnheime/party-2.jpg', alt: 'Große Strauß-Figur mit ausgebreiteten Flügeln, pink und lila beleuchtet im Nebel' },
  { bild: '/wohnheime/party-3.jpg', alt: 'Band auf der Bühne, davor ein Publikum mit erhobenen Händen' },
];

export const ticket = {
  // Ticketshop bei dein-ticket.shop (Event-Seite des Festivals).
  url: 'https://straussifestival.dein-ticket.shop/events/straussifestival-111/straussifestival-111',

  /**
   * Hängt die UTM-Parameter des Besuchs an den Ticketlink an, damit der Ticketshop
   * sieht, über welchen Werbeweg ein Kauf kam (components/UtmWeitergabe.astro,
   * Infos für den Shop: docs/TICKETSHOP-UTM.md). Ohne Zustimmung im Cookie-Banner
   * nur von der Einstiegsseite aus, mit Zustimmung für den ganzen Besuch.
   */
  utmWeitergeben: true,
} as const;

/**
 * Ticketbuttons sind nur klickbar, wenn oben eine echte URL steht. Solange dort
 * noch TODO steht, erscheinen sie ausgegraut ohne Link (siehe TicketButton.astro).
 */
export const ticketAktiv = !ticket.url.includes('TODO');

/**
 * Instagram-Abschnitt auf der Startseite ("Bleib auf dem Laufenden").
 * Ohne Widget (unten) wird nichts von Instagram eingebunden, nur verlinkt; die Fotos
 * der Kacheln sind eigene Dateien. Mit Widget lädt der Feed erst nach Zustimmung.
 * profilUrl ist auch das Ziel der Weiterleitung /redirect-instagram/ (QR-Codes zu Instagram).
 */
export const instagram = {
  profilUrl: 'https://www.instagram.com/straussifestival/',
  name: '@straussifestival',
  /**
   * Eigene Fotos für die Kacheln (Hochformat, ca. 3:4). Datei in web/public/insta/ ablegen und hier eintragen:
   *   { bild: '/insta/foto-1.jpg', alt: 'Kurze Beschreibung des Fotos' }
   * Solange weniger als 5 eingetragen sind, stehen an den freien Stellen Platzhalter.
   */
  fotos: [] as { bild: string; alt: string }[],

  /**
   * Echter Instagram-Feed über das kostenlose Widget von LightWidget (entschieden,
   * ohne Aufruflimit), Anleitung in web/public/insta/README.md.
   *
   * - url: die Adresse aus dem iframe-Einbettungscode des Anbieters (das, was bei src="..." steht).
   * - anbieter: Name des Anbieters, erscheint im Cookie-Banner und muss in die Datenschutzerklärung.
   * - hoehe: Höhe des Feeds in Pixeln (je nach Anzahl der Reihen im Widget anpassen).
   *
   * Solange url leer ist, gibt es weder Feed noch Cookie-Banner, und es bleiben die Kacheln oben.
   * Ist url gesetzt, lädt der Feed ERST nach Zustimmung im Cookie-Banner (vorher die Kacheln).
   */
  widget: {
    url: '', // TODO: iframe-Adresse des LightWidget-Widgets eintragen
    anbieter: 'LightWidget',
    hoehe: 420,
  },
};

/**
 * TikTok-Profil, wird wie Instagram nur verlinkt (kein eingebettetes Video/Widget).
 */
export const tiktok = {
  profilUrl: 'https://www.tiktok.com/@straussifestival',
  name: '@straussifestival',
};

/**
 * Matomo-Tracking (selbst gehostet auf dem Webhosting, stats.<domain>).
 * Adresse und Website-ID kommen aus Umgebungsvariablen (web/.env, siehe
 * web/.env.example). Fehlt einer der beiden Werte, wird Matomo nicht
 * eingebunden und die Seite funktioniert trotzdem.
 *
 * Matomo zählt ohne Cookies. Erst nach "Akzeptieren" im Cookie-Banner setzt
 * es Cookies und erkennt Besucher dann auch über mehrere Tage wieder.
 */
export const analytics = {
  /** z. B. "https://stats.example.org", ohne abschließenden Slash */
  url: (import.meta.env.PUBLIC_MATOMO_URL ?? '').trim().replace(/\/+$/, ''),
  siteId: (import.meta.env.PUBLIC_MATOMO_SITE_ID ?? '').trim(),
  /**
   * Ereignis beim Klick auf den Ticketbutton: Kategorie und Aktion, als Name geht
   * die Stelle mit (header, hero, footer). In Matomo ist das Ziel "Ticketklick"
   * an diese Kategorie geknüpft (siehe deploy/README.md).
   */
  ticketKategorie: 'Ticket',
  ticketAktion: 'Klick',
  /** Ereignis der Weiterleitung /redirect-instagram/ (QR-Codes direkt zu Instagram). */
  instaKategorie: 'Instagram',
  instaAktion: 'Weiterleitung',
};

export const analyticsAktiv = Boolean(analytics.url && analytics.siteId);

/**
 * Der Cookie-Banner erscheint, sobald es etwas zuzustimmen gibt: Matomo-Cookies
 * (Statistik), der Instagram-Feed oder das Merken des Werbewegs für den Ticketshop
 * (ticket.utmWeitergeben). Eine Antwort gilt für alles.
 */
export const bannerAktiv = analyticsAktiv || Boolean(instagram.widget.url) || ticket.utmWeitergeben;
