import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  site: 'https://prosista.ro',
  // Base URL '/' pentru că site-ul rulează direct pe prosista.ro
  base: '/',
  output: 'static', // Static output (hybrid option has been removed)
  integrations: [tailwind()],
  vite: {
    build: {
      cssMinify: true,
    },
  },
});

