/**
 * Astro-Integration: erzeugt beim Build aus src/data/kanaele.ts
 *   - docs/qr/<slug>.svg           QR-Code pro Kanal für die Startseite
 *   - docs/qr/<seite>/<slug>.svg   dasselbe für jede weitere Seite
 *   - docs/kanaele.md              Tabelle mit Slug, UTM-Link und QR-Datei
 * und warnt laut, wenn noch Platzhalter (Domain, Ticket-URL) im Spiel sind.
 */
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import type { AstroIntegration } from 'astro';
import QRCode from 'qrcode';
import { instagram, ticket } from '../src/config';
import { CAMPAIGN, kanaele, kurzPfad, utmQuery } from '../src/data/kanaele';
import { seitenPfade } from './seiten';

/** "/" -> "" (liegt direkt in docs/qr/), "/lineup/" -> "lineup/" (Unterordner). */
const qrOrdner = (seite: string) => seite.replace(/^\//, '');

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

      'astro:build:done': async ({ logger }) => {
        const docsDir = new URL('../docs/', rootDir);
        const qrDir = new URL('qr/', docsDir);
        const platzhalter = istPlatzhalterDomain(site);

        const seiten = seitenPfade(new URL('src/pages/', rootDir));

        // QR-Codes: kompletten Ordner neu aufbauen, damit gelöschte Kanäle und
        // gelöschte Seiten keine alten Dateien hinterlassen.
        await rm(qrDir, { recursive: true, force: true });
        for (const seite of seiten) {
          const ordner = new URL(qrOrdner(seite), qrDir);
          await mkdir(ordner, { recursive: true });
          for (const kanal of kanaele) {
            const svg = await QRCode.toString(`${site}${kurzPfad(kanal, seite)}`, {
              type: 'svg',
              errorCorrectionLevel: 'M',
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
            `| \`${site}${kurzPfad(k)}\` | \`${utmLink}\` | [${k.slug}.svg](qr/${k.slug}.svg) |`
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
          '- **Kurz-URL**: steht im QR-Code und leitet auf die Startseite mit UTM-Parametern weiter.',
          '- **Fertiger UTM-Link**: das Ziel der Weiterleitung, für Links, die nicht als QR-Code laufen.',
          '',
          '| Slug | Beschreibung | Kurz-URL (QR-Code) | Fertiger UTM-Link | QR-Datei |',
          '| --- | --- | --- | --- | --- |',
          ...zeilen,
          '',
          '## Auf eine Unterseite zeigen',
          '',
          'Jeder Kanal funktioniert hinter **jeder** Seite: einfach `/q/<slug>` an den Seitenpfad',
          'hängen. Die UTM-Parameter sind dabei immer dieselben, nur die Seite ändert sich.',
          '',
          '```',
          `${site}/q/mensa           ->  Startseite`,
          `${site}/lineup/q/mensa    ->  Line-up-Seite`,
          '```',
          '',
          'Die passenden QR-Codes liegen fertig im Ordner `qr/` bereit:',
          '',
          '| Seite | QR-Codes |',
          '| --- | --- |',
          ...seiten.map((seite) => {
            const ordner = qrOrdner(seite);
            const ziel = ordner === '' ? 'qr/' : `qr/${ordner}`;
            // /instagram/ ist keine Inhaltsseite, sondern leitet (gezählt) zu Instagram weiter.
            const hinweis = seite === '/instagram/' ? ' (führt direkt zu Instagram)' : '';
            return `| \`${seite}\`${hinweis} | [${ziel}](${ziel}) |`;
          }),
          '',
        ].join('\n');
        await writeFile(new URL('kanaele.md', docsDir), md);

        logger.info(
          `${kanaele.length * seiten.length} QR-Codes (${kanaele.length} Kanäle x ${seiten.length} Seiten) ` +
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
