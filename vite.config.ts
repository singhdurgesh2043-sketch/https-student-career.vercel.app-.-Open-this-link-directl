import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  // CRITICAL FOR ANDROID CAPACITOR & WEBVIEW:
  // Using relative base './' prevents blank screen caused by absolute asset URLs in APK
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false
  },
  server: {
    port: 5173,
    host: true
  }
});
