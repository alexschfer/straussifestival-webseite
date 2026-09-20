import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Alle Seitentexte liegen als Markdown in src/content/seiten/.
 * Der Dateiname ist die Adresse: infos.md -> /infos, "start.md" ist die Startseite.
 */
const seiten = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/seiten' }),
  schema: z.object({
    /** Überschrift der Seite (und Titel im Browser-Tab) */
    title: z.string(),
    /** Kurzbeschreibung für Suchmaschinen und Link-Vorschauen */
    description: z.string(),
    /** Wo der Link erscheint: "haupt" = Menü oben, "fuss" = Fußzeile, "keine" = nirgends */
    navigation: z.enum(['haupt', 'fuss', 'keine']).default('keine'),
    /** Reihenfolge innerhalb von Menü bzw. Fußzeile (kleine Zahl = weiter vorne) */
    reihenfolge: z.number().default(100),
    /** Kurzer Linktext, falls er von der Überschrift abweichen soll */
    linktext: z.string().optional(),
  }),
});

export const collections = { seiten };
