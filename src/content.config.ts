import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const proyectos = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/proyectos' }),
  schema: z.object({
    titulo: z.string(),
    titulo_en: z.string().nullish(),
    cliente: z.string(),
    usuario: z.string().nullish(),
    categoria: z.string(),
    categoria_en: z.string().nullish(),
    descripcion: z.string().nullish(),
    descripcion_en: z.string().nullish(),
    video: z.string().nullish(),
    poster: z.string().nullish(),
    logo: z.string().nullish(),
    orden: z.number().default(99),
  }),
});

export const collections = { proyectos };
