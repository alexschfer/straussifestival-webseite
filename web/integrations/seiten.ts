/**
 * Liste aller Seitenpfade der Webseite, gelesen aus src/pages/.
 *
 * Gebraucht wird sie für die Kanal-Weiterleitungen: Hinter jede Seite darf
 * "/q/<slug>" gehängt werden (siehe src/data/kanaele.ts). Eine neue Seite in
 * src/pages/ bekommt ihre Weiterleitungen dadurch automatisch, ohne dass hier
 * etwas nachgetragen werden muss.
 *
 * Läuft nur beim Bauen (Node), nicht im Browser.
 */
import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/** Seiten, die kein sinnvolles Ziel für einen QR-Code sind. */
const AUSGENOMMEN = new Set(['404']);

/**
 * Ergibt z. B. ["/", "/anfahrt/", "/faq/", "/infos/", "/lineup/"] –
 * immer mit Schrägstrich am Anfang und Ende, die Startseite ist "/".
 */
export function seitenPfade(pagesDir: URL): string[] {
  const dateien = readdirSync(fileURLToPath(pagesDir), { withFileTypes: true });

  const pfade = dateien
    .filter((d) => d.isFile() && d.name.endsWith('.astro'))
    .map((d) => d.name.replace(/\.astro$/, ''))
    .filter((name) => !AUSGENOMMEN.has(name))
    .map((name) => (name === 'index' ? '/' : `/${name}/`));

  return pfade.sort();
}
