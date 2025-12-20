import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.prosista.ro',
  output: 'static',
  integrations: [tailwind()],
  vite: {
    build: {
      cssMinify: true,
    },
  },
});

