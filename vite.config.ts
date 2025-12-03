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
    dedupe: [
      'react', 
      'react-dom', 
      'framer-motion', 
      'react-router-dom',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      'scheduler'
    ],
    preserveSymlinks: false, // Ensure symlinks don't create duplicate instances
    // Force resolution to prevent multiple React instances
    conditions: ['import', 'module', 'browser', 'default'],
  },
  optimizeDeps: {
    include: [
      'react', 
      'react-dom',
      'react/jsx-runtime',
      'react-router-dom', 
      'framer-motion',
      'react-firebase-hooks',
      '@tanstack/react-query'
    ],
    force: true, // Force re-optimization
    esbuildOptions: {
      // Force React to be treated as external/common
      mainFields: ['module', 'main'],
    },
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
    rollupOptions: {
      // Ensure React is never treated as external
      external: [],
      output: {
        // Ensure consistent hashing for cache busting
        // Use content hash to ensure new builds get new hashes even with cached deps
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        // Force content-based hashing to change when code changes
        hashCharacters: 'base64url',
        manualChunks: (id) => {
          // CRITICAL: Keep ALL React-related packages together - don't split them
          // This prevents multiple React instances which cause error #300
          if (
            id.includes('node_modules/react') || 
            id.includes('node_modules/react-dom') ||
            id.includes('node_modules/react-router-dom') ||
            id.includes('node_modules/framer-motion') ||
            id.includes('node_modules/react-firebase-hooks') ||
            id.includes('node_modules/@tanstack/react-query') ||
            id.includes('node_modules/react-hook-form') ||
            id.includes('node_modules/react-hot-toast') ||
            id.includes('node_modules/react-day-picker') ||
            id.includes('node_modules/react-resizable-panels') ||
            id.includes('node_modules/react-helmet') ||
            id.includes('node_modules/embla-carousel-react') ||
            id.includes('node_modules/scheduler') // React's internal scheduler
          ) {
            return 'react-vendor';
          }
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
    // Disable source maps in production to reduce bundle size and prevent DevTools conflicts
    sourcemap: false,
  },
})
