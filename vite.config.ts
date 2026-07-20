import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Merge with process.env to ensure system variables are captured.
  const loadedEnv = loadEnv(mode, (process as any).cwd(), '');
  const env = { ...process.env, ...loadedEnv };

  return {
    resolve: {
      alias: {
        '@': path.resolve('./'),
      },
    },
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
          runtimeCaching: [
            {
              urlPattern: ({ url, request }) => 
                request.destination === 'image' || 
                request.destination === 'video' || 
                request.destination === 'audio' ||
                url.pathname.match(/\.(mp4|webm|mkv|jpg|jpeg|png|gif|webp|svg)$/i),
              handler: 'CacheFirst',
              options: {
                cacheName: 'media-cache',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 30 * 24 * 60 * 60 // 30 Days
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            }
          ]
        },
        manifest: {
          name: 'Shiko Progresin',
          short_name: 'Ndërtimi',
          description: 'A high-end client portal for viewing weekly drone footage, photos, and 3D Gaussian Splat renders of construction projects.',
          theme_color: '#002147',
          background_color: '#002147',
          display: 'standalone',
          orientation: 'portrait',
          start_url: '/',
          icons: [
            {
              src: 'pwa-64x64.png',
              sizes: '64x64',
              type: 'image/png'
            },
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any'  
            },
            {
              src: 'maskable-icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable'
            }
          ]
        }
      })
    ],
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode),
      'process.env.GOOGLE_MAPS_PLATFORM_KEY': JSON.stringify(env.GOOGLE_MAPS_PLATFORM_KEY || '')
    },
    build: {
      outDir: 'dist', // Changed from 'build' to 'dist' for Vercel compatibility
      emptyOutDir: true,
      chunkSizeWarningLimit: 1000,
    }
  };
});