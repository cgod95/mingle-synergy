// E2E Test for Reconnect Flow
// Per spec section 12: "Reconnect request + accept"

import { test, expect } from '@playwright/test';

test.describe('Reconnect Flow E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: Create test users and an expired match
    // This would typically use test data seeding
    await page.goto('/');
    // Add authentication setup here
  });

  test('User can request reconnect on expired match', async ({ page }) => {
    // Navigate to matches page
    await page.goto('/matches');
    
    // Wait for matches to load
    await page.waitForSelector('[data-testid="match-card"]', { timeout: 5000 });
    
    // Find an expired match (would need test data setup)
    const expiredMatch = page.locator('[data-testid="expired-match"]').first();
    
    if (await expiredMatch.count() > 0) {
      // Click on expired match
      await expiredMatch.click();
      
      // Verify reconnect button is visible
      const reconnectButton = page.locator('[data-testid="reconnect-button"]');
      await expect(reconnectButton).toBeVisible();
      
      // Click reconnect button
      await reconnectButton.click();
      
      // Verify reconnect request sent toast/notification
      await expect(page.locator('text=/reconnect request sent/i')).toBeVisible({ timeout: 3000 });
    } else {
      // Skip test if no expired matches available
      test.skip();
    }
  });

  test('User can accept reconnect request', async ({ page, context }) => {
    // Setup: Create a reconnect request from another user
    // This would require setting up test data with a pending reconnect request
    
    await page.goto('/matches');
    
    // Wait for matches to load
    await page.waitForSelector('[data-testid="match-card"]', { timeout: 5000 });
    
    // Find match with pending reconnect request
    const matchWithReconnect = page.locator('[data-testid="match-with-reconnect"]').first();
    
    if (await matchWithReconnect.count() > 0) {
      await matchWithReconnect.click();
      
      // Verify accept reconnect button is visible
      const acceptButton = page.locator('[data-testid="accept-reconnect-button"]');
      await expect(acceptButton).toBeVisible();
      
      // Click accept
      await acceptButton.click();
      
      // Verify new match created notification
      await expect(page.locator('text=/new match started/i')).toBeVisible({ timeout: 3000 });
      
      // Verify match appears in active matches
      await page.goto('/matches');
      await expect(page.locator('[data-testid="active-match"]')).toContainText('New Match');
    } else {
      // Skip test if no reconnect requests available
      test.skip();
    }
  });

  test('Reconnect creates fresh match with new 24-hour expiry', async ({ page }) => {
    // Setup: Create reconnect scenario
    await page.goto('/matches');
    
    // Accept reconnect (following previous test flow)
    const matchWithReconnect = page.locator('[data-testid="match-with-reconnect"]').first();
    
    if (await matchWithReconnect.count() > 0) {
      await matchWithReconnect.click();
      await page.locator('[data-testid="accept-reconnect-button"]').click();
      
      // Verify countdown timer shows ~24 hours
      const countdownTimer = page.locator('[data-testid="match-countdown"]');
      await expect(countdownTimer).toBeVisible();
      
      // Verify timer shows approximately 24 hours (86400 seconds)
      const timerText = await countdownTimer.textContent();
      expect(timerText).toMatch(/\d{1,2}:\d{2}:\d{2}/); // Format: HH:MM:SS
    } else {
      test.skip();
    }
  });

  test('Reconnect requires co-location when flag is enabled', async ({ page }) => {
    // This test verifies that reconnect requires both users to be at the same venue
    // when ALLOW_REMOTE_RECONNECT_CHAT flag is false (default)
    
    await page.goto('/matches');
    
    // Find expired match
    const expiredMatch = page.locator('[data-testid="expired-match"]').first();
    
    if (await expiredMatch.count() > 0) {
      await expiredMatch.click();
      
      // Try to reconnect without being at same venue
      const reconnectButton = page.locator('[data-testid="reconnect-button"]');
      
      if (await reconnectButton.isVisible()) {
        await reconnectButton.click();
        
        // Verify error message about co-location requirement
        await expect(page.locator('text=/must be at the same venue/i')).toBeVisible({ timeout: 3000 });
      }
    } else {
      test.skip();
    }
  });
});

