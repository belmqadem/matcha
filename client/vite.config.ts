import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': '/src',
      '@assets': '/src/assets',
      '@components': '/src/components',
      '@context': '/src/context',
      '@hooks': '/src/hooks',
      '@layout': '/src/layout',
      '@pages': '/src/pages',
      '@services': '/src/services',
      '@types': '/src/types',
      '@utils': '/src/utils',
    },
  },
  server: {
    port: 5173,
    allowedHosts: ['matcha.1337.ma', 'localhost'],
    proxy: {
      '/api': {
        target: 'http://matcha_server:3000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://matcha_server:3000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'ws://matcha_server:3000',
        changeOrigin: true,
        ws: true,
        rewriteWsOrigin: true,
      },
    },
  },
});
