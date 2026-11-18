/**
 * List of all page paths of the website, read from src/pages/.
 *
 * Needed for the channel redirects: "/q/<slug>" may be appended to every page
 * (see src/data/channels.ts). A new page in src/pages/ thereby gets its
 * redirects automatically, without anything having to be added here.
 *
 * Only runs at build time (Node), not in the browser.
 */
import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/** Pages that are not a sensible target for a QR code. */
const EXCLUDED = new Set(['404']);

/**
 * Returns e.g. ["/", "/anfahrt/", "/faq/", "/infos/", "/lineup/"] –
 * always with a slash at the start and end; the home page is "/".
 */
export function pagePaths(pagesDir: URL): string[] {
  const files = readdirSync(fileURLToPath(pagesDir), { withFileTypes: true });

  const paths = files
    .filter((f) => f.isFile() && f.name.endsWith('.astro'))
    .map((f) => f.name.replace(/\.astro$/, ''))
    .filter((name) => !EXCLUDED.has(name))
    .map((name) => (name === 'index' ? '/' : `/${name}/`));

  return paths.sort();
}
