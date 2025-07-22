import { defineConfig } from "vite";
import path from "path";
import react from "@vitejs/plugin-react";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from 'vite-plugin-pwa';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  
  return {
    server: {
      host: 'localhost',
      port: 8083,
      strictPort: false, // Allow fallback to other ports if 8083 is busy
      hmr: {
        host: 'localhost',
        // Remove hardcoded port to let HMR use the same port as the server
        // port: 8083,
      },
    },
    plugins: [
      react({
        // Explicitly configure React plugin
        jsxRuntime: 'automatic',
        jsxImportSource: 'react',
        babel: {
          plugins: [
            ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }]
          ]
        }
      }),
      mode === 'development' &&
      componentTagger(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
        manifest: {
          name: 'Mingle',
          short_name: 'Mingle',
          description: 'Meet people nearby in real time',
          theme_color: '#F3643E',
          background_color: '#ffffff',
          display: 'standalone',
          orientation: 'portrait',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,gif,webp}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            }
          ]
        }
      }),
      isProduction && visualizer({
        open: false,
        gzipSize: true,
        brotliSize: true,
        filename: 'dist/stats.html'
      })
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      target: 'es2015',
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
        },
      },
      rollupOptions: {
        output: {
          // Only apply manual chunks in production
          ...(isProduction && {
            manualChunks: {
              // Vendor chunks (excluding React to prevent multiple instances)
              'router-vendor': ['react-router-dom'],
              'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tabs'],
              'firebase-vendor': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
              'utils-vendor': ['date-fns', 'clsx', 'tailwind-merge'],
              'icons-vendor': ['lucide-react'],
              // Feature chunks
              'auth': ['./src/services/firebase/authService', './src/context/AuthContext'],
              'matching': ['./src/services/matchingService', './src/services/firebase/matchService'],
              'messaging': ['./src/services/messageService', './src/pages/Chat'],
              'venues': ['./src/services/firebase/venueService', './src/pages/VenueList'],
              'admin': ['./src/pages/AdminDashboard', './src/services/businessFeatures'],
            },
          }),
          chunkFileNames: (chunkInfo) => {
            const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
            return `js/[name]-[hash].js`;
          },
          entryFileNames: 'js/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name?.split('.') || [];
            const ext = info[info.length - 1];
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
              return `images/[name]-[hash][extname]`;
            }
            if (/woff2?|eot|ttf|otf/i.test(ext)) {
              return `fonts/[name]-[hash][extname]`;
            }
            return `assets/[name]-[hash][extname]`;
          },
        },
      },
      chunkSizeWarningLimit: 1000,
      sourcemap: false,
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'firebase/app',
        'firebase/auth',
        'firebase/firestore',
        'lucide-react',
        'date-fns',
        'clsx',
        'tailwind-merge'
      ],
      exclude: [
        'firebase/analytics',
        'firebase/performance'
      ]
    },
    preview: {
      port: 8080,
      host: true,
    },
    css: {
      devSourcemap: false,
    },
    define: {
      __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
    },
    experimental: {
      renderBuiltUrl(filename, { hostType }) {
        if (hostType === 'js') {
          return { js: filename };
        } else {
          return { relative: true };
        }
      },
    },
  }
});
