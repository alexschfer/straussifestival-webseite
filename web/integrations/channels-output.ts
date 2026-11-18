/**
 * Astro integration: generates at build time from src/data/channels.ts
 *   - docs/qr/<slug>.svg           QR code per printed channel (utm_medium "scan") for the home page
 *   - docs/qr/<page>/<slug>.svg    the same for every other page
 *   - docs/channels.md             table with slug, UTM link and QR file
 *   - redirect rules at the end of dist/.htaccess (see below)
 * and warns loudly if placeholders (domain, ticket URL) are still in use.
 */
import { appendFile, mkdir, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import type { AstroIntegration } from 'astro';
import QRCode from 'qrcode';
import { instagram, ticket } from '../src/config';
import { CAMPAIGN, channelRedirects, channels, foreignSources, shortPath, targetPath, utmQuery } from '../src/data/channels';
import { pagePaths } from './pages';

/** "/" -> "" (lives directly in docs/qr/), "/lineup/" -> "lineup/" (subfolder). */
const qrFolder = (page: string) => page.replace(/^\//, '');

/**
 * QR codes only for printed channels. WhatsApp, Instagram and TikTok links are
 * tapped directly on the phone; a QR code for them would only cause confusion when printing.
 */
const qrChannels = channels.filter((c) => c.utm_medium === 'scan');

const isPlaceholderDomain = (site: string) => new URL(site).hostname.endsWith('.invalid');

const cell = (text: string) => text.replaceAll('|', '\\|');

export default function channelsOutput(): AstroIntegration {
  let site = '';
  let rootDir = new URL('file:///');

  return {
    name: 'channels-output',
    hooks: {
      'astro:config:done': ({ config }) => {
        site = (config.site ?? '').replace(/\/+$/, '');
        rootDir = config.root;
      },

      'astro:build:done': async ({ dir, logger }) => {
        const docsDir = new URL('../docs/', rootDir);
        const qrDir = new URL('qr/', docsDir);
        const placeholder = isPlaceholderDomain(site);

        const pages = pagePaths(new URL('src/pages/', rootDir));

        // Real redirects for the web server (Cloud86, LiteSpeed/Apache): /q/<slug> jumps
        // directly via HTTP 302 to the page with UTM parameters. Without these rules Astro's
        // meta refresh pages kick in, which briefly show a white page. 302 instead of 301, so
        // browsers don't remember the redirect permanently (channels may still change).
        const rules = Object.entries(channelRedirects(pages)).map(
          ([from, to]) => `RewriteRule ^${from.replace(/^\//, '')}/?$ ${to} [R=302,L,NE]`,
        );
        // Rewrite foreign sources (e.g. "ig" from Instagram) to our channel: same page,
        // but with its UTM parameters. Comes after the /q/ rules, so /q/<slug>?utm_source=ig
        // lands there first (the /q/ rules drop foreign parameters anyway).
        const foreignRules = Object.entries(foreignSources).flatMap(([foreign, slug]) => {
          const channel = channels.find((c) => c.slug === slug)!;
          return [
            `RewriteCond %{QUERY_STRING} (^|&)utm_source=${foreign}(&|$) [NC]`,
            `RewriteRule ^(.*)$ /$1?${utmQuery(channel)} [R=302,L,NE]`,
          ];
        });
        await appendFile(
          new URL('.htaccess', dir),
          [
            '',
            '# Channel redirects (generated automatically from src/data/channels.ts)',
            ...rules,
            '',
            '# Rewrite foreign sources to our own channels (foreignSources in src/data/channels.ts)',
            ...foreignRules,
            '',
          ].join('\n'),
        );

        // QR codes: rebuild the whole folder, so deleted channels and
        // deleted pages leave no old files behind.
        await rm(qrDir, { recursive: true, force: true });
        for (const page of pages) {
          const folder = new URL(qrFolder(page), qrDir);
          await mkdir(folder, { recursive: true });
          for (const channel of qrChannels) {
            const svg = await QRCode.toString(`${site}${shortPath(channel, page)}`, {
              type: 'svg',
              errorCorrectionLevel: 'Q',
              margin: 4,
            });
            await writeFile(new URL(`${channel.slug}.svg`, folder), svg);
          }
        }

        // Channel table
        const rows = channels.map((c) => {
          const utmLink = `${site}${targetPath(c)}`;
          const target = c.target ? ` **Leads to ${c.target === 'instagram' ? 'Instagram' : 'the tickets'}.**` : '';
          return (
            `| \`${c.slug}\` | ${cell(c.description)}${target} ` +
            `| \`${site}${shortPath(c)}\` | \`${utmLink}\` ` +
            `| ${qrChannels.includes(c) ? `[${c.slug}.svg](qr/${c.slug}.svg)` : 'no QR code (share the link)'} |`
          );
        });
        const md = [
          '# Marketing channels',
          '',
          '> This file is generated automatically at build time (`npm run build` in the `web/` folder).',
          '> Do not edit by hand: channels are maintained in `web/src/data/channels.ts`.',
          '',
          ...(placeholder
            ? [
                '> **WARNING: The domain is still a placeholder.** QR codes and links below point',
                `> to \`${site}\` and do not work. Do not print anything before \`SITE_URL\` is set`,
                '> and the site has been rebuilt (see `web/.env.example`).',
                '',
              ]
            : []),
          `Domain: \`${site}\` · Campaign (\`utm_campaign\`): \`${CAMPAIGN}\``,
          '',
          '- **Short URL**: is in the QR code or gets shared, and redirects to the home page with UTM parameters',
          '  (for channels marked "Leads to Instagram", counted and on to Instagram instead).',
          '- **Full UTM link**: the redirect target, for links that are not used as a QR code.',
          '',
          '| Slug | Description | Short URL (QR code or link) | Full UTM link | QR file |',
          '| --- | --- | --- | --- | --- |',
          ...rows,
          '',
          '## Pointing to a subpage',
          '',
          'Every channel works behind **every** page: just append `/q/<slug>` to the page path.',
          'The UTM parameters always stay the same, only the page changes.',
          '',
          '```',
          `${site}/q/flyer           ->  home page`,
          `${site}/lineup/q/flyer    ->  line-up page`,
          '```',
          '',
          'The matching QR codes (printed channels only, `utm_medium` `scan`) are ready in the `qr/` folder:',
          '',
          '| Page | QR codes |',
          '| --- | --- |',
          ...pages.map((page) => {
            const folder = qrFolder(page);
            const target = folder === '' ? 'qr/' : `qr/${folder}`;
            // /redirect-instagram/ is not a content page; it redirects (counted) to Instagram.
            const note = page === '/redirect-instagram/' ? ' (leads straight to Instagram)' : '';
            return `| \`${page}\`${note} | [${target}](${target}) |`;
          }),
          '',
        ].join('\n');
        await writeFile(new URL('channels.md', docsDir), md);
        // The table used to be called kanaele.md; remove a stale copy so only one exists.
        await rm(new URL('kanaele.md', docsDir), { force: true });

        logger.info(
          `Wrote ${qrChannels.length * pages.length} QR codes (${qrChannels.length} printed channels x ${pages.length} pages) ` +
            `and channels.md to ${fileURLToPath(docsDir)}.`,
        );
        if (placeholder) {
          logger.warn(
            `SITE_URL is not set (placeholder ${site}). The QR codes are NOT printable until SITE_URL is set and the site is rebuilt.`,
          );
        }
        if (ticket.url.includes('TODO')) {
          logger.warn('Ticket URL in src/config.ts is still a placeholder (TODO).');
        }
        if (instagram.profileUrl.includes('TODO')) {
          logger.warn('Instagram profile in src/config.ts is still a placeholder (TODO).');
        }
      },
    },
  };
}
