import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@layout': '/src/layout',
      '@pages': '/src/pages',
      '@assets': '/src/assets',
    },
  },
  server: {
    port: 5173,
  },
});
