// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  vite: {
    define: {
      'import.meta.env.PUBLIC_CDN_URL': JSON.stringify(
        process.env.PUBLIC_CDN_URL || 'https://pub-1177376bfc1641b2aeba0cd63a27cb3a.r2.dev'
      ),
    },
  },
});
