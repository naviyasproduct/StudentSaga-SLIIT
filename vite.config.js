import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // relative path
  build: {
    outDir: 'docs',
  },
});
