import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';
import channelsOutput from './integrations/channels-output';
import { pagePaths } from './integrations/pages';
import { channelRedirects } from './src/data/channels';

// SITE_URL comes from web/.env or the environment (see web/.env.example).
// If not set, a recognisable placeholder domain is used; the build then warns.
const env = loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), '');
const site = (env.SITE_URL || 'https://todo-domain.invalid').replace(/\/+$/, '');

export default defineConfig({
  site,
  output: 'static',
  // The floating Astro dev toolbar at the bottom left is only useful while
  // developing and rather confusing for a non-technical team.
  devToolbar: { enabled: false },
  // <page>/q/<slug> -> <page>?utm_...  for every page times every channel,
  // i.e. /q/mensa, /lineup/q/mensa, /infos/q/mensa etc.
  // (sources: src/data/channels.ts and integrations/pages.ts)
  redirects: channelRedirects(pagePaths(new URL('./src/pages/', import.meta.url))),
  integrations: [channelsOutput()],
});
