import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://monument.example',
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [sitemap()],
});
