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
  veranstalter: 'Wohnheimsreferat Straußäcker 3',
  ort: 'Studierendenwohnheime Straußäcker, Stuttgart',
  datum: '11.06.–13.06.2027',
};

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
 * Es wird nichts von Instagram eingebunden, nur verlinkt. Die Fotos sind eigene Dateien.
 */
export const instagram = {
  // TODO: echtes Profil eintragen (Adresse und Anzeigename).
  profilUrl: 'https://www.instagram.com/TODO-benutzername/',
  name: '@TODO-benutzername',
  /**
   * Eigene Fotos für die Kacheln (Hochformat, ca. 3:4). Datei in web/public/insta/ ablegen und hier eintragen:
   *   { bild: '/insta/foto-1.jpg', alt: 'Kurze Beschreibung des Fotos' }
   * Solange weniger als 5 eingetragen sind, stehen an den freien Stellen Platzhalter.
   */
  fotos: [] as { bild: string; alt: string }[],
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
};

export const analyticsAktiv = Boolean(analytics.host && analytics.websiteId);
