import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'unsplash-images',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
        ],
      },
    }),
  ],
  server: {
    port: 5173,
    strictPort: false, // Allow Vite to use next available port if 5173 is taken
    hmr: {
      // Don't specify port - let Vite use the same port as the server
      // This prevents "ws://localhost:undefined" errors when port changes
      protocol: 'ws',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Force single React instance - CRITICAL for fixing hooks errors
      'react': path.resolve(__dirname, './node_modules/react'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
      // CRITICAL: Force framer-motion to use the same React instance
      'framer-motion': path.resolve(__dirname, './node_modules/framer-motion'),
    },
    dedupe: ['react', 'react-dom', 'framer-motion'],
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'framer-motion'], // Include framer-motion but force it to use same React
    force: true, // Force re-optimization
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Don't split React - keep it in main bundle
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react-vendor';
          }
          // Exclude framer-motion from bundling to prevent React instance conflicts
          // If needed elsewhere, it will be loaded separately
          if (id.includes('node_modules/firebase')) {
            return 'firebase-vendor';
          }
          if (id.includes('node_modules/@radix-ui')) {
            return 'ui-vendor';
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000, // 1MB warning threshold
  },
})
