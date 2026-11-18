/**
 * Remembers the answer from the cookie banner (Matomo statistics cookies and
 * Instagram feed, one answer for both).
 *
 * Only "ja" or "nein" is stored in the browser's local storage (localStorage),
 * so the banner doesn't reappear on every page view. Without an answer nothing loads
 * from third parties and Matomo sets no cookies. Agreeing or declining fires the
 * event "consent", which the Instagram section and Matomo
 * (Analytics.astro, which reads the key there directly) listen to.
 *
 * The key 'straussi-einwilligung' and the values 'ja'/'nein' are stored in visitors'
 * browsers: do not rename them, or existing consents would be lost.
 */

export const STORAGE_KEY = 'straussi-einwilligung';

export type Answer = 'ja' | 'nein' | null;

export function readAnswer(): Answer {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === 'ja' || value === 'nein' ? value : null;
  } catch {
    // e.g. storage blocked in private mode: then "not asked yet" applies.
    return null;
  }
}

export function saveAnswer(answer: 'ja' | 'nein') {
  try {
    localStorage.setItem(STORAGE_KEY, answer);
  } catch {
    // Cannot be stored: the answer then only applies to this page view.
  }
  document.dispatchEvent(new CustomEvent('consent', { detail: answer }));
}

/** Opens the cookie banner again (link "Cookie-Einstellungen" in the footer). */
export function openBanner() {
  document.dispatchEvent(new CustomEvent('consent-open'));
}
