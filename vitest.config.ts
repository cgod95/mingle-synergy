import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/setupTests.ts'],
    // Only run tests that live under src/. Rescue / archived / backups
    // contain legacy test files that no longer match current modules.
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.rescue/**',
      '**/.archived/**',
      '**/.backups/**',
      '**/coverage/**',
      '**/ios/**',
      '**/functions/**',
      '**/tests/**',
      // Playwright E2E and visual regression specs require playwright runner
      'src/testing/e2e/**',
      'src/testing/visual-regression/**',
    ],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/setupTests.ts',
        '.rescue/**',
        '.archived/**',
        '.backups/**',
      ],
    },
  },
});
