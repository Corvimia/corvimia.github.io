import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
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
}); 