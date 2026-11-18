/**
 * Bilingual support (German/English).
 *
 * - German pages live in src/pages/ as before, the English ones with the same
 *   file name in src/pages/en/ (e.g. infos.astro -> en/infos.astro, address /en/infos/).
 * - The language follows from the address: everything under /en/ is English.
 * - Texts of the shared building blocks (menu, footer, banner, buttons, countdown …)
 *   live below in TEXTS, once per language. The page texts themselves live
 *   directly in the pages.
 * - New page: create a German AND an English file, otherwise the language switch
 *   leads nowhere (404) in the other language.
 */

import { festival } from './config';

export type Language = 'de' | 'en';

/** Read the language from the address: /en/... is English, everything else German. */
export function languageOf(url: URL): Language {
  return url.pathname === '/en' || url.pathname.startsWith('/en/') ? 'en' : 'de';
}

/** Path in the other language: /infos/ <-> /en/infos/, / <-> /en/ */
export function pathInLanguage(path: string, target: Language): string {
  const without = path.replace(/^\/en(?=\/|$)/, '') || '/';
  return target === 'en' ? `/en${without === '/' ? '/' : without}` : without;
}

/** Internal link in the current language: localPath('/infos/', 'en') -> '/en/infos/' */
export function localPath(path: string, language: Language): string {
  return pathInLanguage(path, language);
}

export const TEXTS = {
  de: {
    skipToContent: 'Zum Inhalt springen',
    mainMenu: 'Hauptmenü',
    legal: 'Rechtliches',
    soon: 'bald',
    menu: {
      home: 'Start',
      info: 'Infos',
      lineup: 'Line-up',
      faq: 'FAQ',
      directions: 'Anfahrt',
      residents: 'Bewohner*innen',
      imprint: 'Impressum',
      privacy: 'Datenschutz',
    },
    languageSwitch: 'Sprache',
    organizer: festival.organizer,
    location: festival.location,
    otherLanguage: { short: 'EN', name: 'English', lang: 'en' },
    followUs: 'Folge uns',
    followUsText: 'Neuigkeiten gibt es zuerst auf Instagram und TikTok.',
    onInstagram: 'auf Instagram',
    onTikTok: 'auf TikTok',
    tickets: 'Tickets',
    buyTickets: 'Tickets kaufen',
    salesText: ['Der Verkauf läuft über unseren ', 'Ticketpartner', '.'],
    contact: 'Kontakt',
    cookieSettings: 'Cookie-Einstellungen',
    // Countdown (home page)
    countdownTitle: 'Countdown bis zum',
    countdownAria: 'Countdown bis zum Festivalbeginn',
    days: 'Tage',
    hours: 'Stunden',
    minutes: 'Minuten',
    seconds: 'Sekunden',
    countdownOver: 'Es ist so weit – schön, dass ihr da seid!',
    // Calendar button (home page)
    calendarButton: 'In den Kalender eintragen',
    calendarGoogle: 'Google Kalender',
    calendarIcs: 'Apple, Outlook & andere (.ics)',
    calendarDescription: 'Festival der Studierendenwohnheime Straussi. Infos und Tickets:',
    // Map (directions page)
    mapAlt: 'Kartenausschnitt: Das Festivalgelände bei den Straussi-Wohnheimen an der Universitätsstraße ist pink markiert, nordöstlich davon die Bushaltestelle Schranne und die S-Bahn-Station Universität.',
    mapSource: 'Karte',
    mapContributors: 'OpenStreetMap-Mitwirkende',
    mapOpen: 'Öffnen in',
    mapApple: 'Apple Karten',
    // Instagram section (home page)
    instaTitle: 'Bleib auf dem Laufenden',
    instaText: 'Folge uns auf Instagram oder TikTok, um nichts zu verpassen.',
    instaPhotos: 'Fotos',
    instaFeedNotice: 'Hier können unsere neuesten Instagram-Beiträge erscheinen. Dafür brauchen wir deine Zustimmung.',
    instaFeedButton: 'Instagram-Feed anzeigen',
    instaFeedTitle: 'Unsere neuesten Instagram-Beiträge',
    // Festival A to Z
    abcAria: 'Festival-ABC nach Anfangsbuchstaben',
    // Cookie banner
    bannerTitle: 'Cookies erlauben?',
    bannerStatistics:
      'Mit deiner Zustimmung setzt unsere eigene Besucherstatistik (Matomo, auf unserem eigenen Webspace) Cookies, damit wir sehen, ob du später wiederkommst. Ohne Zustimmung zählen wir nur anonym ohne Cookies.',
    bannerChannel:
      'Außerdem merken wir uns während deines Besuchs, über welchen Werbeweg (z. B. Flyer) du gekommen bist, und geben ihn beim Klick auf „Tickets kaufen“ an den Ticketshop weiter.',
    bannerFeed: (provider: string) =>
      `Außerdem zeigen wir dann auf der Startseite unsere neuesten Instagram-Beiträge. Dafür wird ein Dienst von ${provider} geladen, der Daten (z. B. deine IP-Adresse) erhält und Cookies setzen kann.`,
    bannerMore: ['Mehr dazu in der ', 'Datenschutzerklärung', '.'],
    decline: 'Ablehnen',
    accept: 'Akzeptieren',
  },
  en: {
    skipToContent: 'Skip to content',
    mainMenu: 'Main menu',
    legal: 'Legal',
    soon: 'soon',
    menu: {
      home: 'Home',
      info: 'Info',
      lineup: 'Line-up',
      faq: 'FAQ',
      directions: 'Getting there',
      residents: 'Residents',
      imprint: 'Legal notice',
      privacy: 'Privacy',
    },
    languageSwitch: 'Language',
    organizer: 'A team of residents of Straussi 1, 2 & 3',
    location: 'Straussi student residences, Stuttgart',
    otherLanguage: { short: 'DE', name: 'Deutsch', lang: 'de' },
    followUs: 'Follow us',
    followUsText: 'News come first on Instagram and TikTok.',
    onInstagram: 'on Instagram',
    onTikTok: 'on TikTok',
    tickets: 'Tickets',
    buyTickets: 'Buy tickets',
    salesText: ['Tickets are sold by our ', 'ticket partner', '.'],
    contact: 'Contact',
    cookieSettings: 'Cookie settings',
    countdownTitle: 'Countdown to',
    countdownAria: 'Countdown to the start of the festival',
    days: 'Days',
    hours: 'Hours',
    minutes: 'Minutes',
    seconds: 'Seconds',
    countdownOver: "It's time – great to have you here!",
    calendarButton: 'Add to calendar',
    calendarGoogle: 'Google Calendar',
    calendarIcs: 'Apple, Outlook & others (.ics)',
    calendarDescription: 'Festival of the Straussi student residences. Info and tickets:',
    mapAlt: 'Map section: the festival site at the Straussi residences on Universitätsstraße is marked in pink, with the Schranne bus stop and Universität S-Bahn station to the north-east.',
    mapSource: 'Map',
    mapContributors: 'OpenStreetMap contributors',
    mapOpen: 'Open in',
    mapApple: 'Apple Maps',
    instaTitle: 'Stay in the loop',
    instaText: "Follow us on Instagram or TikTok so you don't miss a thing.",
    instaPhotos: 'Photos',
    instaFeedNotice: 'Our latest Instagram posts can appear here. For that we need your consent.',
    instaFeedButton: 'Show Instagram feed',
    instaFeedTitle: 'Our latest Instagram posts',
    abcAria: 'Festival A to Z by first letter',
    bannerTitle: 'Allow cookies?',
    bannerStatistics:
      'With your consent, our own visitor statistics (Matomo, on our own web space) set cookies so we can see whether you come back later. Without consent we only count anonymously without cookies.',
    bannerChannel:
      'We also remember during your visit which promotion (e.g. a flyer) brought you here and pass it on to the ticket shop when you click “Buy tickets”.',
    bannerFeed: (provider: string) =>
      `We will then also show our latest Instagram posts on the home page. This loads a service from ${provider}, which receives data (e.g. your IP address) and may set cookies.`,
    bannerMore: ['More in our ', 'privacy policy', '.'],
    decline: 'Decline',
    accept: 'Accept',
  },
} as const;

export type Texts = (typeof TEXTS)[Language];
