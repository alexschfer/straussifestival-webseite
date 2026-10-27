/**
 * Astro-Integration: erzeugt beim Build aus src/data/kanaele.ts
 *   - docs/qr/<slug>.svg           QR-Code pro gedrucktem Kanal (utm_medium "scan") für die Startseite
 *   - docs/qr/<seite>/<slug>.svg   dasselbe für jede weitere Seite
 *   - docs/kanaele.md              Tabelle mit Slug, UTM-Link und QR-Datei
 *   - Weiterleitungsregeln am Ende von dist/.htaccess (siehe unten)
 * und warnt laut, wenn noch Platzhalter (Domain, Ticket-URL) im Spiel sind.
 */
import { appendFile, mkdir, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import type { AstroIntegration } from 'astro';
import QRCode from 'qrcode';
import { instagram, ticket } from '../src/config';
import { CAMPAIGN, fremdeQuellen, kanaele, kanalRedirects, kurzPfad, utmQuery } from '../src/data/kanaele';
import { seitenPfade } from './seiten';

/** "/" -> "" (liegt direkt in docs/qr/), "/lineup/" -> "lineup/" (Unterordner). */
const qrOrdner = (seite: string) => seite.replace(/^\//, '');

/**
 * QR-Codes nur für gedruckte Kanäle. WhatsApp-, Instagram- und TikTok-Links werden
 * direkt am Handy angetippt, ein QR-Code dafür würde nur beim Drucken verwirren.
 */
const qrKanaele = kanaele.filter((k) => k.utm_medium === 'scan');

const istPlatzhalterDomain = (site: string) => new URL(site).hostname.endsWith('.invalid');

const zelle = (text: string) => text.replaceAll('|', '\\|');

export default function kanaeleOutput(): AstroIntegration {
  let site = '';
  let rootDir = new URL('file:///');

  return {
    name: 'kanaele-output',
    hooks: {
      'astro:config:done': ({ config }) => {
        site = (config.site ?? '').replace(/\/+$/, '');
        rootDir = config.root;
      },

      'astro:build:done': async ({ dir, logger }) => {
        const docsDir = new URL('../docs/', rootDir);
        const qrDir = new URL('qr/', docsDir);
        const platzhalter = istPlatzhalterDomain(site);

        const seiten = seitenPfade(new URL('src/pages/', rootDir));

        // Echte Weiterleitungen für den Webserver (Cloud86, LiteSpeed/Apache): /q/<slug> springt
        // direkt per HTTP 302 auf die Seite mit UTM-Parametern. Ohne diese Regeln greifen die
        // Meta-Refresh-Seiten von Astro, die kurz eine weiße Seite zeigen. 302 statt 301, damit
        // Browser die Weiterleitung nicht dauerhaft merken (Kanäle können sich noch ändern).
        const regeln = Object.entries(kanalRedirects(seiten)).map(
          ([von, nach]) => `RewriteRule ^${von.replace(/^\//, '')}/?$ ${nach} [R=302,L,NE]`,
        );
        // Fremde Quellen (z. B. "ig" von Instagram) auf unseren Kanal umschreiben: gleiche Seite,
        // aber mit dessen UTM-Parametern. Steht nach den /q/-Regeln, damit /q/<slug>?utm_source=ig
        // erst dort landet (die /q/-Regeln verwerfen fremde Parameter ohnehin).
        const fremdRegeln = Object.entries(fremdeQuellen).flatMap(([fremd, slug]) => {
          const kanal = kanaele.find((k) => k.slug === slug)!;
          return [
            `RewriteCond %{QUERY_STRING} (^|&)utm_source=${fremd}(&|$) [NC]`,
            `RewriteRule ^(.*)$ /$1?${utmQuery(kanal)} [R=302,L,NE]`,
          ];
        });
        await appendFile(
          new URL('.htaccess', dir),
          [
            '',
            '# Kanal-Weiterleitungen (automatisch erzeugt aus src/data/kanaele.ts)',
            ...regeln,
            '',
            '# Fremde Quellen auf eigene Kanäle umschreiben (fremdeQuellen in src/data/kanaele.ts)',
            ...fremdRegeln,
            '',
          ].join('\n'),
        );

        // QR-Codes: kompletten Ordner neu aufbauen, damit gelöschte Kanäle und
        // gelöschte Seiten keine alten Dateien hinterlassen.
        await rm(qrDir, { recursive: true, force: true });
        for (const seite of seiten) {
          const ordner = new URL(qrOrdner(seite), qrDir);
          await mkdir(ordner, { recursive: true });
          for (const kanal of qrKanaele) {
            const svg = await QRCode.toString(`${site}${kurzPfad(kanal, seite)}`, {
              type: 'svg',
              errorCorrectionLevel: 'Q',
              margin: 4,
            });
            await writeFile(new URL(`${kanal.slug}.svg`, ordner), svg);
          }
        }

        // Kanaltabelle
        const zeilen = kanaele.map((k) => {
          const utmLink = `${site}/?${utmQuery(k)}`;
          return (
            `| \`${k.slug}\` | ${zelle(k.beschreibung)} ` +
            `| \`${site}${kurzPfad(k)}\` | \`${utmLink}\` ` +
            `| ${qrKanaele.includes(k) ? `[${k.slug}.svg](qr/${k.slug}.svg)` : 'kein QR-Code (Link teilen)'} |`
          );
        });
        const md = [
          '# Marketingkanäle',
          '',
          '> Diese Datei wird beim Build automatisch erzeugt (`npm run build` im Ordner `web/`).',
          '> Nicht von Hand bearbeiten: Kanäle werden in `web/src/data/kanaele.ts` gepflegt.',
          '',
          ...(platzhalter
            ? [
                '> **ACHTUNG: Die Domain ist noch ein Platzhalter.** QR-Codes und Links unten zeigen',
                `> auf \`${site}\` und funktionieren nicht. Nichts drucken, bevor \`SITE_URL\` gesetzt`,
                '> und neu gebaut wurde (siehe `web/.env.example`).',
                '',
              ]
            : []),
          `Domain: \`${site}\` · Kampagne (\`utm_campaign\`): \`${CAMPAIGN}\``,
          '',
          '- **Kurz-URL**: steht im QR-Code bzw. wird geteilt und leitet auf die Startseite mit UTM-Parametern weiter.',
          '- **Fertiger UTM-Link**: das Ziel der Weiterleitung, für Links, die nicht als QR-Code laufen.',
          '',
          '| Slug | Beschreibung | Kurz-URL (QR-Code oder Link) | Fertiger UTM-Link | QR-Datei |',
          '| --- | --- | --- | --- | --- |',
          ...zeilen,
          '',
          '## Auf eine Unterseite zeigen',
          '',
          'Jeder Kanal funktioniert hinter **jeder** Seite: einfach `/q/<slug>` an den Seitenpfad',
          'hängen. Die UTM-Parameter sind dabei immer dieselben, nur die Seite ändert sich.',
          '',
          '```',
          `${site}/q/flyer           ->  Startseite`,
          `${site}/lineup/q/flyer    ->  Line-up-Seite`,
          '```',
          '',
          'Die passenden QR-Codes (nur gedruckte Kanäle, `utm_medium` `scan`) liegen fertig im Ordner `qr/` bereit:',
          '',
          '| Seite | QR-Codes |',
          '| --- | --- |',
          ...seiten.map((seite) => {
            const ordner = qrOrdner(seite);
            const ziel = ordner === '' ? 'qr/' : `qr/${ordner}`;
            // /redirect-instagram/ ist keine Inhaltsseite, sondern leitet (gezählt) zu Instagram weiter.
            const hinweis = seite === '/redirect-instagram/' ? ' (führt direkt zu Instagram)' : '';
            return `| \`${seite}\`${hinweis} | [${ziel}](${ziel}) |`;
          }),
          '',
        ].join('\n');
        await writeFile(new URL('kanaele.md', docsDir), md);

        logger.info(
          `${qrKanaele.length * seiten.length} QR-Codes (${qrKanaele.length} gedruckte Kanäle x ${seiten.length} Seiten) ` +
            `und kanaele.md nach ${fileURLToPath(docsDir)} geschrieben.`,
        );
        if (platzhalter) {
          logger.warn(
            `SITE_URL ist nicht gesetzt (Platzhalter ${site}). Die QR-Codes sind NICHT druckbar, bis SITE_URL gesetzt und neu gebaut ist.`,
          );
        }
        if (ticket.url.includes('TODO')) {
          logger.warn('Ticket-URL in src/config.ts ist noch ein Platzhalter (TODO).');
        }
        if (instagram.profilUrl.includes('TODO')) {
          logger.warn('Instagram-Profil in src/config.ts ist noch ein Platzhalter (TODO).');
        }
      },
    },
  };
}
