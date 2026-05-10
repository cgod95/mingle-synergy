import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: false,
    hmr: {
      protocol: 'ws',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Force single React instance - CRITICAL for fixing hooks errors
      'react': path.resolve(__dirname, './node_modules/react'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
      'react/jsx-runtime': path.resolve(__dirname, './node_modules/react/jsx-runtime'),
      'react/jsx-dev-runtime': path.resolve(__dirname, './node_modules/react/jsx-dev-runtime'),
      'scheduler': path.resolve(__dirname, './node_modules/scheduler'),
      // CRITICAL: Force framer-motion to use the same React instance
      'framer-motion': path.resolve(__dirname, './node_modules/framer-motion'),
    },
    dedupe: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      'framer-motion',
      'react-router-dom',
      'scheduler',
    ],
    preserveSymlinks: false,
    conditions: ['import', 'module', 'browser', 'default'],
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      'react-router-dom',
      'framer-motion',
      '@tanstack/react-query',
    ],
  },
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
    rollupOptions: {
      external: [],
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        manualChunks: (id) => {
          // CRITICAL: Keep ALL React-related packages together in one chunk to
          // avoid multiple React instances (error #300). Includes the
          // scheduler and framer-motion which depend on a single React.
          if (
            id.includes('node_modules/react') ||
            id.includes('node_modules/react-dom') ||
            id.includes('react/jsx-runtime') ||
            id.includes('react/jsx-dev-runtime') ||
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
            id.includes('node_modules/scheduler')
          ) {
            return 'react-vendor';
          }
          if (id.includes('node_modules/firebase')) {
            return 'firebase-vendor';
          }
          if (id.includes('node_modules/@radix-ui')) {
            return 'ui-vendor';
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'icons-vendor';
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
    minify: 'esbuild',
  },
})
