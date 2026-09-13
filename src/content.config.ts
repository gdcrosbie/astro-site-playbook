import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { file, glob } from 'astro/loaders';

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

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: 'src/content/posts' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    order: z.number().default(0),
  }),
});

export const collections = {
  sample,
  posts,
};
