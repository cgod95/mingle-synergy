import { test, expect } from '@playwright/test';

test.describe('Venue Check-in Flow E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display venue list page', async ({ page }) => {
    // Navigate to venue list
    await page.goto('/venues');
    
    await expect(page.getByText('Venues Near You')).toBeVisible();
    await expect(page.getByText('The Velvet Lounge')).toBeVisible();
    await expect(page.getByText('Neon Terrace')).toBeVisible();
    await expect(page.getByText('Garden Underground')).toBeVisible();
  });

  test('should display venue details when venue is clicked', async ({ page }) => {
    // Navigate to venue list
    await page.goto('/venues');
    
    // Click on a venue
    await page.getByText('The Velvet Lounge').click();
    
    // Should navigate to venue details
    await expect(page.getByText('The Velvet Lounge')).toBeVisible();
    await expect(page.getByText('Sydney')).toBeVisible();
    await expect(page.getByText(/A chic cocktail venue with live music/)).toBeVisible();
  });

  test('should display venue happenings section', async ({ page }) => {
    // Navigate directly to venue details
    await page.goto('/venue/1');
    
    await expect(page.getByText("Tonight's Happenings")).toBeVisible();
    await expect(page.getByText('More info coming soon...')).toBeVisible();
  });

  test('should show venue not found for invalid venue ID', async ({ page }) => {
    // Navigate to invalid venue ID
    await page.goto('/venue/999');
    
    await expect(page.getByText('Venue not found')).toBeVisible();
  });
}); 