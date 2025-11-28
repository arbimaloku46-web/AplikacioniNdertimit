import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    resolve: {
      alias: {
        '@': path.resolve('./'),
      },
    },
    plugins: [
      react(),
      // Handle PWA manifest and Service Worker automatically
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
        manifest: {
          id: "/",
          scope: "/",
          short_name: "Ndërtimi",
          name: "Shiko Progresin - Ndërtimi",
          description: "Client portal for construction progress monitoring with drone footage and 3D scans.",
          theme_color: "#002147",
          background_color: "#002147",
          display: "standalone",
          orientation: "portrait",
          icons: [
            {
              src: "https://cdn-icons-png.flaticon.com/512/25/25694.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "any maskable"
            },
            {
              src: "https://cdn-icons-png.flaticon.com/512/25/25694.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any maskable"
            }
          ],
          screenshots: [
             {
                src: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=1000",
                sizes: "1000x667",
                type: "image/jpeg",
                form_factor: "wide",
                label: "Dashboard View"
             }
          ],
          categories: ["business", "productivity"],
          shortcuts: [
            {
              name: "My Profile",
              short_name: "Profile",
              description: "View your account settings",
              url: "/?view=profile",
              icons: [{ "src": "https://cdn-icons-png.flaticon.com/512/25/25694.png", "sizes": "192x192" }]
            }
          ]
        }
      })
    ],
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      'process.env.NODE_ENV': JSON.stringify(mode),
    },
    build: {
      outDir: 'build',
      emptyOutDir: true,
      chunkSizeWarningLimit: 1000,
    }
  };
});