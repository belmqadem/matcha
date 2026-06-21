import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

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
    allowedHosts: ['matcha.1337.dev', 'localhost'],
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
        ws: true, // This tells Vite to proxy WebSocket connections!
        rewriteWsOrigin: true,
      },
    },
  },
});
// import { defineConfig } from 'vite';
// import tailwindcss from '@tailwindcss/vite';
// import react from '@vitejs/plugin-react';

// export default defineConfig({
//   plugins: [react(), tailwindcss()],
//   resolve: {
//     alias: {
//       '@': '/src',
//       '@components': '/src/components',
//       '@layout': '/src/layout',
//       '@pages': '/src/pages',
//       '@assets': '/src/assets',
//     },
//   },
//   server: {
//     port: 5173,
//     // proxy: {
//     //   '/api': {
//     //     target: 'http://matcha_server:3000',        changeOrigin: true,
//     //   },
//     //   '/uploads': 'http://localhost:3000',
//     // },
//     proxy: {
//   '/api': {
//     target: 'http://matcha_server:3000',
//     changeOrigin: true,
//   },
//   '/uploads': {
//     target: 'http://matcha_server:3000',
//     changeOrigin: true,
//   },
// },
//   },
// });
