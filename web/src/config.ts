/**
 * Zentrale Konfiguration der Webseite.
 * Alles, was sich ändern kann (Ticket-Link, Schalter, Eckdaten), steht hier.
 * Texte der Seiten stehen NICHT hier, sondern als Markdown in src/content/seiten/.
 */

export const festival = {
  name: 'Straußi Festival 2027',
  kurzname: 'Straußi Festival',
  veranstalter: 'Wohnheimsreferat Straußäcker 3',
  ort: 'Studierendenwohnheime Straußäcker, Stuttgart',
  // TODO: Datum eintragen, sobald es feststeht (Freitext, z. B. "12. Juni 2027").
  datum: 'TODO Datum',
} as const;

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
