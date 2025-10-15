import { test, expect } from '@playwright/test';

test.describe('Onboarding Flow', () => {
  test('new user completes onboarding and lands on venues', async ({ page }) => {
    await page.goto('/sign-up');

    const suffix = Math.random().toString(36).slice(2, 8);
    const email = `e2e_${suffix}@example.com`;
    const password = `P@ssw0rd_${suffix}`;

    const emailInput = page
      .getByTestId('signup-email')
      .or(page.locator('input[type="email"]'))
      .or(page.locator('input[name*="email" i]'))
      .first();

    const passwordInput = page
      .getByTestId('signup-password')
      .or(page.locator('input[type="password"]'))
      .or(page.locator('input[name*="pass" i]'))
      .first();

    await emailInput.fill(email);
    await passwordInput.fill(password);

    const submitBtn = page
      .getByTestId('signup-submit')
      .or(page.getByRole('button', { name: /create|sign up|continue/i }))
      .first();

    await submitBtn.click();

    const ctas = [/allow/i, /continue/i, /next/i, /finish/i, /done/i];
    for (const rx of ctas) {
      const btn = page.getByRole('button', { name: rx }).first();
      if (await btn.isVisible().catch(() => false)) {
        await btn.click().catch(() => {});
      }
    }

    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const onVenues =
      (await page.url()).includes('/venues') ||
      (await page.getByRole('heading', { name: /venues/i }).isVisible().catch(() => false));

    expect(onVenues).toBeTruthy();
  });
});
