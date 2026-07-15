import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/auth': 'http://localhost:3001',
      '/users': 'http://localhost:3001',
      '/connections': 'http://localhost:3001',
      '/reports': 'http://localhost:3001',
      '/dashboard': 'http://localhost:3001',
      '/scheduler': 'http://localhost:3001',
      '/logout': 'http://localhost:3001',
      '/health': 'http://localhost:3001',
    },
  },
});
