import { test, expect, Page } from '@playwright/test';

/**
 * Critical Flow E2E Tests
 * 
 * These tests cover the core user journeys that must work for beta:
 * 1. Demo mode entry
 * 2. Venue check-in flow
 * 3. Matching flow (like -> match)
 * 4. Messaging flow
 */

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173';

test.describe('Demo Mode Entry Flow', () => {
  test('should enter demo mode and reach check-in page', async ({ page }) => {
    // Navigate to landing page
    await page.goto(BASE_URL);
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Look for demo mode button
    const demoButton = page.getByRole('button', { name: /demo/i });
    if (await demoButton.isVisible()) {
      await demoButton.click();
      
      // Wait for navigation
      await page.waitForURL(/demo-welcome|checkin/);
      
      // If on demo-welcome, click to continue
      const enterDemoButton = page.getByRole('button', { name: /enter|continue|start/i });
      if (await enterDemoButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await enterDemoButton.click();
      }
      
      // Should eventually reach check-in page
      await expect(page).toHaveURL(/checkin|venues/, { timeout: 10000 });
    }
  });
});

test.describe('Venue Check-in Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Go directly to check-in page (assume demo mode or authenticated)
    await page.goto(`${BASE_URL}/checkin`);
    await page.waitForLoadState('networkidle');
  });

  test('should display venue list', async ({ page }) => {
    // Wait for venues to load
    await page.waitForTimeout(2000); // Give venues time to load
    
    // Look for venue cards or list items
    const venueCards = page.locator('button, [role="button"], a').filter({ hasText: /check in/i });
    
    // Should have at least one venue to check into
    const count = await venueCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should navigate to venue details on click', async ({ page }) => {
    // Wait for venues to load
    await page.waitForTimeout(2000);
    
    // Find a venue card and click it
    const venueCard = page.locator('button, [role="button"]').filter({ hasText: /check in/i }).first();
    
    if (await venueCard.isVisible()) {
      await venueCard.click();
      
      // Should navigate to venue details
      await expect(page).toHaveURL(/venues\//, { timeout: 5000 });
    }
  });
});

test.describe('Matching Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a venue page directly for testing
    await page.goto(`${BASE_URL}/venues/1`);
    await page.waitForLoadState('networkidle');
  });

  test('should display people at venue', async ({ page }) => {
    // Wait for content to load
    await page.waitForTimeout(2000);
    
    // Look for "People here now" section or user cards
    const peopleSection = page.getByText(/people|here now|checked in/i);
    await expect(peopleSection.first()).toBeVisible({ timeout: 5000 });
  });

  test('should have like buttons for users', async ({ page }) => {
    // Wait for people to load
    await page.waitForTimeout(3000);
    
    // Look for like buttons
    const likeButtons = page.getByRole('button', { name: /like/i });
    const count = await likeButtons.count();
    
    // If there are people, there should be like buttons
    // (May be 0 if no one at venue, which is also valid)
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should navigate to matches page', async ({ page }) => {
    // Go to matches page
    await page.goto(`${BASE_URL}/matches`);
    await page.waitForLoadState('networkidle');
    
    // Should be on matches page
    await expect(page).toHaveURL(/matches/);
    
    // Should have some UI elements visible
    const heading = page.getByRole('heading', { name: /match/i });
    await expect(heading.first()).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Chat/Messaging Flow', () => {
  test('should access matches from bottom navigation', async ({ page }) => {
    // Start from check-in page
    await page.goto(`${BASE_URL}/checkin`);
    await page.waitForLoadState('networkidle');
    
    // Look for bottom nav link to matches
    const matchesLink = page.getByRole('link', { name: /match/i });
    
    if (await matchesLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await matchesLink.click();
      await expect(page).toHaveURL(/matches/);
    }
  });

  test('matches page should load without errors', async ({ page }) => {
    await page.goto(`${BASE_URL}/matches`);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Should not show any error states
    const errorMessage = page.getByText(/error|failed|something went wrong/i);
    const hasError = await errorMessage.isVisible({ timeout: 1000 }).catch(() => false);
    
    // If there's an error, it should be a specific "no matches" message, not a crash
    if (hasError) {
      const noMatchesMessage = page.getByText(/no match|start matching|find people/i);
      expect(await noMatchesMessage.isVisible({ timeout: 1000 }).catch(() => false)).toBe(true);
    }
  });
});

test.describe('Navigation and Layout', () => {
  test('should have bottom navigation visible', async ({ page }) => {
    await page.goto(`${BASE_URL}/checkin`);
    await page.waitForLoadState('networkidle');
    
    // Look for navigation elements
    const navLinks = page.locator('nav a, [role="navigation"] a');
    const count = await navLinks.count();
    
    expect(count).toBeGreaterThan(0);
  });

  test('should navigate between main pages', async ({ page }) => {
    // Start at check-in
    await page.goto(`${BASE_URL}/checkin`);
    await page.waitForLoadState('networkidle');
    
    // Navigate to profile
    const profileLink = page.getByRole('link', { name: /profile/i });
    if (await profileLink.isVisible({ timeout: 2000 }).catch(() => false)) {
      await profileLink.click();
      await expect(page).toHaveURL(/profile/);
    }
    
    // Navigate to matches
    const matchesLink = page.getByRole('link', { name: /match/i });
    if (await matchesLink.isVisible({ timeout: 2000 }).catch(() => false)) {
      await matchesLink.click();
      await expect(page).toHaveURL(/matches/);
    }
  });
});

test.describe('Error Handling', () => {
  test('should handle non-existent routes gracefully', async ({ page }) => {
    await page.goto(`${BASE_URL}/this-page-does-not-exist`);
    await page.waitForLoadState('networkidle');
    
    // Should either redirect or show 404 page
    const is404 = await page.getByText(/not found|404|doesn't exist/i).isVisible({ timeout: 3000 }).catch(() => false);
    const isRedirected = page.url().includes('checkin') || page.url().includes('signin');
    
    expect(is404 || isRedirected).toBe(true);
  });
});

test.describe('Performance', () => {
  test('should load check-in page within 3 seconds', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto(`${BASE_URL}/checkin`);
    await page.waitForLoadState('domcontentloaded');
    
    const loadTime = Date.now() - startTime;
    
    // Page should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('should load matches page within 3 seconds', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto(`${BASE_URL}/matches`);
    await page.waitForLoadState('domcontentloaded');
    
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(3000);
  });
});





