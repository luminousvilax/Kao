/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Base path for GitHub Pages; usually /<repo-name>/
  // We will assume root for now, but this might need changing if deployed to a project page
  base: './',
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    css: true,
  },
  build: {
    // Default is 4096 (4kb). Set to 0 to force all assets to be separate files.
    // For 400+ icons, separate files are usually better for caching.
    assetsInlineLimit: 0, 
  },
});
