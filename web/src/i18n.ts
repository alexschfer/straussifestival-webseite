/**
 * Zweisprachigkeit (Deutsch/Englisch).
 *
 * - Deutsche Seiten liegen wie bisher in src/pages/, die englischen mit demselben
 *   Dateinamen in src/pages/en/ (z. B. infos.astro -> en/infos.astro, Adresse /en/infos/).
 * - Die Sprache ergibt sich aus der Adresse: alles unter /en/ ist Englisch.
 * - Texte der gemeinsamen Bausteine (Menü, Fußzeile, Banner, Buttons, Countdown …)
 *   stehen hier unten in TEXTE, je einmal pro Sprache. Die Seitentexte selbst stehen
 *   direkt in den Seiten.
 * - Neue Seite: deutsche UND englische Datei anlegen, sonst führt der Sprachumschalter
 *   auf der anderen Sprache ins Leere (404).
 */

import { festival } from './config';

export type Sprache = 'de' | 'en';

/** Sprache aus der Adresse ablesen: /en/... ist Englisch, alles andere Deutsch. */
export function spracheVon(url: URL): Sprache {
  return url.pathname === '/en' || url.pathname.startsWith('/en/') ? 'en' : 'de';
}

/** Pfad in der anderen Sprache: /infos/ <-> /en/infos/, / <-> /en/ */
export function pfadInSprache(pfad: string, ziel: Sprache): string {
  const ohne = pfad.replace(/^\/en(?=\/|$)/, '') || '/';
  return ziel === 'en' ? `/en${ohne === '/' ? '/' : ohne}` : ohne;
}

/** Interner Link in der aktuellen Sprache: lokal('/infos/', 'en') -> '/en/infos/' */
export function lokal(pfad: string, sprache: Sprache): string {
  return pfadInSprache(pfad, sprache);
}

export const TEXTE = {
  de: {
    zumInhalt: 'Zum Inhalt springen',
    hauptmenue: 'Hauptmenü',
    rechtliches: 'Rechtliches',
    bald: 'bald',
    menue: {
      start: 'Start',
      infos: 'Infos',
      lineup: 'Line-up',
      faq: 'FAQ',
      anfahrt: 'Anfahrt',
      bewohner: 'Bewohner*innen',
      impressum: 'Impressum',
      datenschutz: 'Datenschutz',
    },
    sprachwahl: 'Sprache',
    veranstalter: festival.veranstalter,
    ort: festival.ort,
    andereSprache: { kurz: 'EN', name: 'English', lang: 'en' },
    folgeUns: 'Folge uns',
    folgeUnsText: 'Neuigkeiten gibt es zuerst auf Instagram und TikTok.',
    aufInstagram: 'auf Instagram',
    aufTikTok: 'auf TikTok',
    tickets: 'Tickets',
    ticketsKaufen: 'Tickets kaufen',
    verkaufText: ['Der Verkauf läuft über unseren ', 'Ticketpartner', '.'],
    kontakt: 'Kontakt',
    cookieEinstellungen: 'Cookie-Einstellungen',
    // Countdown (Startseite)
    countdownTitel: 'Countdown bis zum',
    countdownAria: 'Countdown bis zum Festivalbeginn',
    tage: 'Tage',
    stunden: 'Stunden',
    minuten: 'Minuten',
    sekunden: 'Sekunden',
    countdownVorbei: 'Es ist so weit – schön, dass ihr da seid!',
    // Kalender-Knopf (Startseite)
    kalenderKnopf: 'In den Kalender eintragen',
    kalenderGoogle: 'Google Kalender',
    kalenderIcs: 'Apple, Outlook & andere (.ics)',
    kalenderBeschreibung: 'Festival der Studierendenwohnheime Straußäcker. Infos und Tickets:',
    // Karte (Anfahrt)
    karteAlt: 'Kartenausschnitt: Das Festivalgelände bei den Wohnanlagen Straußäcker an der Universitätsstraße ist pink markiert, nordöstlich davon die Bushaltestelle Schranne und die S-Bahn-Station Universität.',
    karteQuelle: 'Karte',
    karteMitwirkende: 'OpenStreetMap-Mitwirkende',
    karteOeffnen: 'Öffnen in',
    karteApple: 'Apple Karten',
    // Instagram-Abschnitt (Startseite)
    instaTitel: 'Bleib auf dem Laufenden',
    instaText: 'Folge uns auf Instagram oder TikTok, um nichts zu verpassen.',
    instaFotos: 'Fotos',
    instaFeedHinweis: 'Hier können unsere neuesten Instagram-Beiträge erscheinen. Dafür brauchen wir deine Zustimmung.',
    instaFeedKnopf: 'Instagram-Feed anzeigen',
    instaFeedTitel: 'Unsere neuesten Instagram-Beiträge',
    // Festival-ABC
    abcAria: 'Festival-ABC nach Anfangsbuchstaben',
    // Cookie-Banner
    bannerTitel: 'Cookies erlauben?',
    bannerStatistik:
      'Mit deiner Zustimmung setzt unsere eigene Besucherstatistik (Matomo, auf unserem eigenen Webspace) Cookies, damit wir sehen, ob du später wiederkommst. Ohne Zustimmung zählen wir nur anonym ohne Cookies.',
    bannerWerbeweg:
      'Außerdem merken wir uns während deines Besuchs, über welchen Werbeweg (z. B. Flyer) du gekommen bist, und geben ihn beim Klick auf „Tickets kaufen“ an den Ticketshop weiter.',
    bannerFeed: (anbieter: string) =>
      `Außerdem zeigen wir dann auf der Startseite unsere neuesten Instagram-Beiträge. Dafür wird ein Dienst von ${anbieter} geladen, der Daten (z. B. deine IP-Adresse) erhält und Cookies setzen kann.`,
    bannerMehr: ['Mehr dazu in der ', 'Datenschutzerklärung', '.'],
    ablehnen: 'Ablehnen',
    akzeptieren: 'Akzeptieren',
  },
  en: {
    zumInhalt: 'Skip to content',
    hauptmenue: 'Main menu',
    rechtliches: 'Legal',
    bald: 'soon',
    menue: {
      start: 'Home',
      infos: 'Info',
      lineup: 'Line-up',
      faq: 'FAQ',
      anfahrt: 'Getting there',
      bewohner: 'Residents',
      impressum: 'Legal notice',
      datenschutz: 'Privacy',
    },
    sprachwahl: 'Language',
    veranstalter: 'A team of residents of Straussi 1, 2 & 3',
    ort: 'Straußäcker student residences, Stuttgart',
    andereSprache: { kurz: 'DE', name: 'Deutsch', lang: 'de' },
    folgeUns: 'Follow us',
    folgeUnsText: 'News come first on Instagram and TikTok.',
    aufInstagram: 'on Instagram',
    aufTikTok: 'on TikTok',
    tickets: 'Tickets',
    ticketsKaufen: 'Buy tickets',
    verkaufText: ['Tickets are sold by our ', 'ticket partner', '.'],
    kontakt: 'Contact',
    cookieEinstellungen: 'Cookie settings',
    countdownTitel: 'Countdown to',
    countdownAria: 'Countdown to the start of the festival',
    tage: 'Days',
    stunden: 'Hours',
    minuten: 'Minutes',
    sekunden: 'Seconds',
    countdownVorbei: "It's time – great to have you here!",
    kalenderKnopf: 'Add to calendar',
    kalenderGoogle: 'Google Calendar',
    kalenderIcs: 'Apple, Outlook & others (.ics)',
    kalenderBeschreibung: 'Festival of the Straußäcker student residences. Info and tickets:',
    karteAlt: 'Map section: the festival site at the Straußäcker residences on Universitätsstraße is marked in pink, with the Schranne bus stop and Universität S-Bahn station to the north-east.',
    karteQuelle: 'Map',
    karteMitwirkende: 'OpenStreetMap contributors',
    karteOeffnen: 'Open in',
    karteApple: 'Apple Maps',
    instaTitel: 'Stay in the loop',
    instaText: "Follow us on Instagram or TikTok so you don't miss a thing.",
    instaFotos: 'Photos',
    instaFeedHinweis: 'Our latest Instagram posts can appear here. For that we need your consent.',
    instaFeedKnopf: 'Show Instagram feed',
    instaFeedTitel: 'Our latest Instagram posts',
    abcAria: 'Festival A to Z by first letter',
    bannerTitel: 'Allow cookies?',
    bannerStatistik:
      'With your consent, our own visitor statistics (Matomo, on our own web space) set cookies so we can see whether you come back later. Without consent we only count anonymously without cookies.',
    bannerWerbeweg:
      'We also remember during your visit which promotion (e.g. a flyer) brought you here and pass it on to the ticket shop when you click “Buy tickets”.',
    bannerFeed: (anbieter: string) =>
      `We will then also show our latest Instagram posts on the home page. This loads a service from ${anbieter}, which receives data (e.g. your IP address) and may set cookies.`,
    bannerMehr: ['More in our ', 'privacy policy', '.'],
    ablehnen: 'Decline',
    akzeptieren: 'Accept',
  },
} as const;

export type Texte = (typeof TEXTE)[Sprache];
