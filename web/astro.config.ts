import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';
import kanaeleOutput from './integrations/kanaele-output';
import { kanalRedirects } from './src/data/kanaele';

// SITE_URL kommt aus web/.env bzw. der Umgebung (siehe web/.env.example).
// Ohne Angabe gilt eine erkennbare Platzhalter-Domain; der Build warnt dann.
const env = loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), '');
const site = (env.SITE_URL || 'https://todo-domain.invalid').replace(/\/+$/, '');

export default defineConfig({
  site,
  output: 'static',
  // Die schwebende Astro-Werkzeugleiste unten links ist nur beim Entwickeln
  // nützlich und für ein nicht-technisches Team eher verwirrend.
  devToolbar: { enabled: false },
  // /q/<slug> -> /?utm_...  (Quelle: src/data/kanaele.ts)
  redirects: kanalRedirects(),
  integrations: [kanaeleOutput()],
});
