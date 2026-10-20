/**
 * Zentrale Konfiguration der Webseite.
 * Alles, was sich ändern kann (Ticket-Link, Schalter, Eckdaten), steht hier.
 * Texte der Seiten stehen NICHT hier, sondern direkt in den Dateien unter src/pages/ (z. B. infos.astro).
 */

const kurzname = 'Straußi Festival';
const jahr = '2027';

export const festival = {
  kurzname,
  jahr,
  name: `${kurzname} ${jahr}`,
  veranstalter: 'Team aus Bewohner*innen des Straußi 1, 2 & 3',
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
 * Eigene Fotos für die Hintergrund-Collage im Startbildschirm (Querformat).
 * Datei in web/public/wohnheime/ ablegen und hier eintragen, siehe README dort.
 */
export const startBilder: { bild: string; alt: string }[] = [
  { bild: '/wohnheime/hof-1.jpg', alt: 'Innenhof der Wohnheime mit Terrasse, Fahrrädern und Beet' },
  { bild: '/wohnheime/hof-2.jpg', alt: 'Grüner Innenhof der Wohnheime mit Bäumen und Sitzgelegenheiten' },
  { bild: '/wohnheime/hof-3.jpg', alt: 'Von Bäumen gesäumter Weg zwischen zwei Wohnheimgebäuden' },
];

export const ticket = {
  // TODO: echte Ticketshop-URL eintragen (aktuell Platzhalter, der Button funktioniert erst danach).
  url: 'https://dein-ticket.shop/TODO-echte-ticket-url',

  /**
   * Hängt die UTM-Parameter des aktuellen Besuchs an den Ticketlink an, bevor
   * der Besucher zum Ticketshop wechselt (kleines Skript, siehe TicketButton).
   *
   * Standardmäßig AUS: Es ist noch ungeklärt, ob der Ticketshop UTMs auswertet.
   * Erst auf true setzen, wenn das geklärt ist.
   */
  utmWeitergeben: false,
} as const;

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
 * Umami-Tracking. Host und Website-ID kommen aus Umgebungsvariablen
 * (web/.env, siehe web/.env.example). Fehlt einer der beiden Werte, wird
 * das Skript nicht eingebunden und die Seite funktioniert trotzdem.
 */
export const analytics = {
  /** z. B. "https://stats.example.org", ohne abschließenden Slash */
  host: (import.meta.env.PUBLIC_UMAMI_HOST ?? '').trim().replace(/\/+$/, ''),
  websiteId: (import.meta.env.PUBLIC_UMAMI_WEBSITE_ID ?? '').trim(),
  /** Name des Klick-Events, das der Ticketbutton auslöst. */
  ticketEvent: 'ticket-click',
  /** Ereignis der Weiterleitung /redirect-instagram/ (QR-Codes direkt zu Instagram). */
  instaEvent: 'insta-weiterleitung',
};

export const analyticsAktiv = Boolean(analytics.host && analytics.websiteId);
