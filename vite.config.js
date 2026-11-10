import { defineConfig } from 'vite';

export default defineConfig({
  // ./ allows the same artifact on GitHub Pages project URLs and local previews.
  base: './',
  build: { outDir: 'dist', assetsDir: 'assets', emptyOutDir: true },
});
