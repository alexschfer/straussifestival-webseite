/**
 * Kalenderdatei /kalender.ics für den Knopf "In den Kalender eintragen"
 * (components/KalenderButton.astro). Wird beim Bauen als feste Datei erzeugt.
 * Datum und Ort kommen aus src/config.ts (kalender, festival.adresse). Ganztägiger Termin.
 *
 * Keine .astro-Datei, deshalb bekommt sie keine /q/-Weiterleitungen (integrations/seiten.ts).
 */
import type { APIRoute } from 'astro';
import { festival, kalenderTage } from '../config';

/** Sonderzeichen im Text nach Kalender-Standard (RFC 5545) maskieren. */
const maskieren = (text: string) => text.replace(/[\\;,]/g, (zeichen) => `\\${zeichen}`).replace(/\n/g, '\\n');

export const GET: APIRoute = ({ site }) => {
  const seite = site ? new URL(site).origin : '';
  const host = site ? new URL(site).host : 'straussifestival';
  const tage = kalenderTage();
  const jetzt = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');

  const zeilen = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Straussi Festival//Webseite//DE',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:straussi-festival-${festival.jahr}@${host}`,
    `DTSTAMP:${jetzt}`,
    `DTSTART;VALUE=DATE:${tage.beginn}`,
    `DTEND;VALUE=DATE:${tage.ende}`,
    `SUMMARY:${maskieren(festival.name)}`,
    `LOCATION:${maskieren(festival.adresse)}`,
    `DESCRIPTION:${maskieren(`Infos und Tickets: ${seite}`)}`,
    `URL:${seite}/`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  // Kalenderdateien brauchen Windows-Zeilenenden (CRLF).
  return new Response(zeilen.join('\r\n') + '\r\n', {
    headers: { 'Content-Type': 'text/calendar; charset=utf-8' },
  });
};
