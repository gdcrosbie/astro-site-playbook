import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://example.com',
  output: 'static',
  integrations: [sitemap({
    filter: (page) => !page.includes('/contact/success/') && !page.includes('/contact/error/'),
  })],
  devToolbar: {
    enabled: false,
  },
});
