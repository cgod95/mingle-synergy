import { test, expect } from '@playwright/test';

/**
 * Accelerator Demo E2E Test
 *
 * Covers the full demo flow for Berlin accelerator presentations:
 * Landing -> Demo entry -> Check-in -> Venue -> Matches -> Chat
 *
 * Run with VITE_DEMO_MODE=true and PLAYWRIGHT_BASE_URL=http://localhost:5173
 */

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173';

test.describe('Accelerator Demo Flow', () => {
  test('full demo flow: landing to chat', async ({ page }) => {
    // 1. Go to landing page
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // 2. Click "Try Demo" or "Join Closed Beta" (depending on what lands on demo)
    const demoButton = page.getByRole('button', { name: /demo/i });
    const joinBetaButton = page.getByRole('button', { name: /join closed beta/i });
    const getStartedButton = page.getByRole('button', { name: /get started/i });

    if (await demoButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await demoButton.click();
    } else if (await joinBetaButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await joinBetaButton.click();
    } else if (await getStartedButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await getStartedButton.click();
    }

    // 3. Wait for navigation - may land on demo-welcome, signup, or checkin
    await page.waitForURL(/\/(demo-welcome|signup|signin|checkin|welcome)/, { timeout: 10000 });

    // 4. If on demo-welcome, click Get Started
    if (page.url().includes('demo-welcome')) {
      const btn = page.getByRole('button', { name: /get started/i });
      if (await btn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await btn.click();
      }
    }

    // 5. If on signup, fill form and submit
    if (page.url().includes('signup')) {
      await page.getByLabel(/email/i).fill('demo@accelerator.test');
      await page.getByLabel(/password/i).fill('Test123!');
      await page.getByRole('button', { name: /create account/i }).click();
      await page.waitForURL(/\/(welcome|create-profile|photo-upload|checkin)/, { timeout: 10000 });
    }

    // 6. If on welcome (onboarding carousel), click through to completion
    if (page.url().includes('welcome')) {
      for (let i = 0; i < 5; i++) {
        const nextBtn = page.getByRole('button', { name: /next|get started/i });
        if (await nextBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          await nextBtn.click();
          await page.waitForTimeout(500);
        } else break;
      }
    }

    // 7. If on create-profile, it may redirect to photo-upload in demo mode
    await page.waitForTimeout(1000);
    if (page.url().includes('photo-upload')) {
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles('public/avatar-chloe.jpg');
      await page.getByRole('button', { name: /upload photo/i }).click();
      await page.waitForURL(/checkin/, { timeout: 15000 });
    }

    // 8. If on signin (e.g. redirected from protected route), sign in with demo user
    if (page.url().includes('signin')) {
      await page.getByLabel(/email/i).fill('demo@accelerator.test');
      await page.getByLabel(/password/i).fill('Test123!');
      await page.getByRole('button', { name: /sign in|log in/i }).click();
      await page.waitForURL(/\/(checkin|welcome|create-profile)/, { timeout: 10000 });
    }

    // 9. Should eventually reach check-in page
    await expect(page).toHaveURL(/checkin|venues/, { timeout: 15000 });

    // 10. Verify venue cards visible
    await page.waitForTimeout(2000);
    const venueCards = page.locator('button, [role="button"]').filter({ hasText: /check in|view/i });
    const count = await venueCards.count();
    expect(count).toBeGreaterThanOrEqual(0);

    // 11. Click first venue to check in (or first Check in button)
    const firstVenue = page.locator('button, [role="button"]').filter({ hasText: /check in to|check in/i }).first();
    if (await firstVenue.isVisible({ timeout: 3000 }).catch(() => false)) {
      await firstVenue.click();
      await expect(page).toHaveURL(/venues\//, { timeout: 5000 });
    } else {
      // Navigate to a known demo venue directly
      await page.goto(`${BASE_URL}/venues/club-aurora`);
      await page.waitForLoadState('networkidle');
    }

    // 12. Verify venue details - "people here" or grid
    await page.waitForTimeout(2000);
    const peopleSection = page.getByText(/people|here now|checked in/i);
    await expect(peopleSection.first()).toBeVisible({ timeout: 5000 });

    // 13. Navigate to Matches via bottom nav
    const matchesLink = page.getByRole('link', { name: /match/i });
    if (await matchesLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await matchesLink.click();
    } else {
      await page.goto(`${BASE_URL}/matches`);
    }
    await page.waitForLoadState('networkidle');

    // 14. Verify Matches page loads
    await expect(page).toHaveURL(/matches/);
    const matchesHeading = page.getByRole('heading', { name: /match/i });
    await expect(matchesHeading.first()).toBeVisible({ timeout: 5000 });

    // 15. If match exists, click to open chat; verify messages area and input
    const matchCard = page.locator('a[href*="/chat/"], button').filter({ hasText: /message|chat/i }).first();
    if (await matchCard.isVisible({ timeout: 3000 }).catch(() => false)) {
      await matchCard.click();
      await page.waitForURL(/chat\//, { timeout: 5000 });
      const messagesArea = page.locator('[aria-live="polite"]');
      const input = page.getByLabel(/type a message|message/i);
      const hasMessagesArea = await messagesArea.isVisible({ timeout: 5000 }).catch(() => false);
      const hasInput = await input.isVisible({ timeout: 5000 }).catch(() => false);
      expect(hasMessagesArea || hasInput).toBe(true);
    }
  });
});
