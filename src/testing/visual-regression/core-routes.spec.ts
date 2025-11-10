// Visual Regression Tests for 5 Core Routes
// Per spec section 12: "Snapshot 5 core routes against golden baseline"

import { test, expect } from '@playwright/test';

const CORE_ROUTES = [
  { path: '/', name: 'Landing Page' },
  { path: '/checkin', name: 'Check In Page' },
  { path: '/matches', name: 'Matches Page' },
  { path: '/profile', name: 'Profile Page' },
  { path: '/venues/venue1', name: 'Venue Details Page' },
];

test.describe('Visual Regression Tests - Core Routes', () => {
  // Setup: Login before accessing protected routes
  test.beforeEach(async ({ page }) => {
    // For demo mode, we may need to set up a test user
    // For now, we'll test public routes and handle auth separately
  });

  for (const route of CORE_ROUTES) {
    test(`Visual snapshot: ${route.name}`, async ({ page }) => {
      // Navigate to route
      await page.goto(route.path);
      
      // Wait for page to be fully loaded
      await page.waitForLoadState('networkidle');
      
      // Wait for any animations to complete
      await page.waitForTimeout(500);
      
      // Take screenshot
      await expect(page).toHaveScreenshot(`${route.name.toLowerCase().replace(/\s+/g, '-')}.png`, {
        fullPage: true,
        animations: 'disabled', // Disable animations for consistent screenshots
      });
    });
  }

  // Test responsive breakpoints
  test.describe('Responsive Visual Tests', () => {
    const viewports = [
      { width: 375, height: 667, name: 'mobile' }, // iPhone SE
      { width: 768, height: 1024, name: 'tablet' }, // iPad
      { width: 1920, height: 1080, name: 'desktop' }, // Desktop
    ];

    for (const viewport of viewports) {
      test(`Landing Page - ${viewport.name} viewport`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);
        
        await expect(page).toHaveScreenshot(`landing-page-${viewport.name}.png`, {
          fullPage: true,
          animations: 'disabled',
        });
      });
    }
  });
});

