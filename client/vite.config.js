import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig(({ command }) => ({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    // Mismo origen en desarrollo: /api → backend local (igual que el rewrite de Vercel en producción)
    proxy: {
      '/api': { target: 'http://localhost:4000', changeOrigin: true },
      '/sitemap.xml': { target: 'http://localhost:4000', changeOrigin: true, rewrite: () => '/api/sitemap.xml' },
    },
  },
  esbuild: command === 'build' ? { drop: ['console', 'debugger'], legalComments: 'none' } : undefined,
  build: {
    sourcemap: false, // sin mapas: el código de producción no se puede leer "como fuente" en DevTools
    // Sin <link rel=modulepreload>: los chunks no compiten con el primer pintado del shell del hero
    modulePreload: false,
    // Separa las librerías pesadas en chunks propios para mejorar el cacheo
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          motion: ['framer-motion'],
          forms: ['react-hook-form', 'zod', '@hookform/resolvers'],
        },
      },
    },
  },
}));
