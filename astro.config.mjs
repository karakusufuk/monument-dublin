import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  server: { port: 4404, host: '127.0.0.1' },
  site: 'https://monument.ufuk.ie',
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [sitemap()],
});
