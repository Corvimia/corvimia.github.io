import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // Register the service worker
      registerType: 'autoUpdate',
      // Include all files in the build
      includeAssets: ['**/*'],
      // Configure manifest
      manifest: false, // We're using our own manifest file
      // Configure workbox options
      workbox: {
        // Cache the files based on strategy
        runtimeCaching: [
          {
            // Cache page navigations
            urlPattern: new RegExp('^https://(.*?)/'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 1 week
              },
            },
          },
          {
            // Cache CSS, JS, and Web Worker requests
            urlPattern: /\.(?:js|css|woff2?|ttf|eot)$/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-resources',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
          {
            // Cache image files
            urlPattern: /\.(?:png|jpg|jpeg|gif|webp|svg|ico)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'out',
    // Ensure static assets are copied to output directory
    assetsDir: 'assets',
  },
  base: process.env.NODE_ENV === 'production' ? '/corvimia.github.io' : '/',
  server: {
    port: parseInt(process.env.VITE_PORT || '5173'),
    allowedHosts: ['mia.test', 'corvimia.github.io']
  }
}); 