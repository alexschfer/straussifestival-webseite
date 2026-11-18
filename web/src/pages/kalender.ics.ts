/**
 * Calendar file /kalender.ics for the button "In den Kalender eintragen"
 * (components/CalendarButton.astro). Generated as a static file at build time.
 * Date and location come from src/config.ts (calendar, festival.address). All-day event.
 *
 * Not an .astro file, so it gets no /q/ redirects (integrations/pages.ts).
 */
import type { APIRoute } from 'astro';
import { calendarDays, festival } from '../config';

/** Escape special characters in text according to the calendar standard (RFC 5545). */
const escapeText = (text: string) => text.replace(/[\\;,]/g, (char) => `\\${char}`).replace(/\n/g, '\\n');

export const GET: APIRoute = ({ site }) => {
  const origin = site ? new URL(site).origin : '';
  const host = site ? new URL(site).host : 'straussifestival';
  const days = calendarDays();
  const now = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Straussi Festival//Webseite//DE',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:straussi-festival-${festival.year}@${host}`,
    `DTSTAMP:${now}`,
    `DTSTART;VALUE=DATE:${days.start}`,
    `DTEND;VALUE=DATE:${days.end}`,
    `SUMMARY:${escapeText(festival.name)}`,
    `LOCATION:${escapeText(festival.address)}`,
    `DESCRIPTION:${escapeText(`Infos und Tickets: ${origin}`)}`,
    `URL:${origin}/`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  // Calendar files need Windows line endings (CRLF).
  return new Response(lines.join('\r\n') + '\r\n', {
    headers: { 'Content-Type': 'text/calendar; charset=utf-8' },
  });
};
