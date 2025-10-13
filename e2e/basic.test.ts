import { test, expect } from '@playwright/test';

test.describe('Basic E2E Tests', () => {
  test('homepage loads with correct title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Mingle/i);
  });

  test('sign-in page is accessible', async ({ page }) => {
    await page.goto('/sign-in');
    await expect(page.locator('body')).toBeVisible();
  });

  test('sign-up page is accessible', async ({ page }) => {
    await page.goto('/sign-up');
    await expect(page.locator('body')).toBeVisible();
  });

  test('venues page redirects to sign-in when not authenticated', async ({ page }) => {
    await page.goto('/venues');
    // Should redirect to sign-in when not authenticated
    await expect(page).toHaveURL(/.*sign-in/);
  });
}); 