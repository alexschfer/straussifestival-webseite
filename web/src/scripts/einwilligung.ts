/**
 * Merkt sich die Antwort aus dem Cookie-Banner (Statistik-Cookies von Matomo und
 * Instagram-Feed, eine Antwort für beides).
 *
 * Gespeichert wird nur "ja" oder "nein" im lokalen Speicher des Browsers (localStorage),
 * damit der Banner nicht bei jedem Seitenaufruf neu erscheint. Ohne Antwort lädt nichts
 * von Drittanbietern und Matomo setzt keine Cookies. Wer zustimmt oder ablehnt, löst das
 * Ereignis "einwilligung" aus, auf das der Instagram-Abschnitt und Matomo
 * (Analytics.astro, liest den Schlüssel dort direkt) hören.
 */

export const SCHLUESSEL = 'straussi-einwilligung';

export type Antwort = 'ja' | 'nein' | null;

export function leseAntwort(): Antwort {
  try {
    const wert = localStorage.getItem(SCHLUESSEL);
    return wert === 'ja' || wert === 'nein' ? wert : null;
  } catch {
    // z. B. Speicher im privaten Modus gesperrt: dann gilt "noch nicht gefragt".
    return null;
  }
}

export function speichereAntwort(antwort: 'ja' | 'nein') {
  try {
    localStorage.setItem(SCHLUESSEL, antwort);
  } catch {
    // Nicht speicherbar: Die Antwort gilt dann nur für diesen Seitenaufruf.
  }
  document.dispatchEvent(new CustomEvent('einwilligung', { detail: antwort }));
}

/** Öffnet den Cookie-Banner erneut (Link "Cookie-Einstellungen" in der Fußzeile). */
export function oeffneBanner() {
  document.dispatchEvent(new CustomEvent('einwilligung-oeffnen'));
}
