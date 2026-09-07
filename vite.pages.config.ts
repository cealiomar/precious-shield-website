import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/postcss';

export default defineConfig({
  base: '/precious-shield-website/',
  plugins: [react()],
  css: { postcss: { plugins: [tailwindcss()] } },
  resolve: { alias: { '@': fileURLToPath(new URL('.', import.meta.url)) } },
  define: {
    'process.env.NEXT_PUBLIC_BASE_PATH': JSON.stringify(
      '/precious-shield-website',
    ),
  },
  build: { outDir: 'dist/client', emptyOutDir: true },
});
