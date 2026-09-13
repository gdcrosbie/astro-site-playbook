import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { file } from 'astro/loaders';

const sample = defineCollection({
  loader: file('src/content/sample.json'),
  schema: z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    href: z.string().default('#'),
    order: z.number().default(0), // Critical: prevents alphabetical sorting gotchas
  }),
});

export const collections = {
  sample,
};
