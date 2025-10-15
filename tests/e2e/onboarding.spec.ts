import { test, expect } from '@playwright/test';

test.describe('Onboarding Flow', () => {
  test('new user completes onboarding and lands on venues', async ({ page }) => {
    await page.goto('/');

    // Try visible sign-up entry point; fallback to direct route
    const signUpLink = page.getByRole('link', { name: /sign up|create account/i }).first();
    if (await signUpLink.isVisible().catch(() => false)) {
      await signUpLink.click();
    } else {
      await page.goto('/sign-up');
    }

    const suffix = Math.random().toString(36).slice(2, 8);
    const email = `e2e_${suffix}@example.com`;
    const password = `P@ssw0rd_${suffix}`;

    const emailInput =
      page.locator('input[type="email"]').first()
        .or(page.locator('input[name*="email" i]')).first()
        .or(page.getByTestId('signup-email').first());
    const passwordInput =
      page.locator('input[type="password"]').first()
        .or(page.locator('input[name*="pass" i]')).first()
        .or(page.getByTestId('signup-password').first());

    await emailInput.fill(email);
    await passwordInput.fill(password);

    const submitBtn =
      page.getByRole('button', { name: /create|sign up|continue/i }).first()
        .or(page.getByTestId('signup-submit').first());
    await submitBtn.click();

    await page.waitForLoadState('domcontentloaded');

    // Best-effort to advance any optional onboarding screens
    const ctas = [/allow/i, /continue/i, /next/i, /finish/i, /done/i];
    for (const rx of ctas) {
      const btn = page.getByRole('button', { name: rx }).first();
      if (await btn.isVisible().catch(() => false)) {
        await btn.click().catch(() => {});
      }
    }

    await page.waitForTimeout(500);
    const onVenues =
      (await page.url()).includes('/venues') ||
      (await page.getByRole('heading', { name: /venues/i }).isVisible().catch(() => false));
    expect(onVenues).toBeTruthy();
  });
});
import { test, expect } from '@playwright/test';

// NOTE: requires dev server running at http://localhost:5173 (vite default)
// and Firebase emulators started via npx firebase emulators:start

test.describe('Onboarding Flow', () => {
  const email = `user${Date.now()}@example.com`;
  const password = 'Testpass123!';

  test('new user completes onboarding and lands on venues', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Landing -> sign-up
    await page.getByRole('link', { name: /create account/i }).click();

    // Sign-up form
    await page.getByLabel(/email/i).fill(email);
    await page.getByLabel(/password/i).fill(password);
    await page.getByRole('button', { name: /create account/i }).click();

    // Create profile screen
    await expect(page).toHaveURL(/create-profile/);
    await page.getByLabel(/name/i).fill('Playwright Test');
    await page.getByLabel(/age/i).fill('25');
    await page.getByRole('button', { name: /continue/i }).click();

    // Upload photos – skip
    await expect(page).toHaveURL(/upload-photos/);
    await page.getByRole('button', { name: /skip/i }).click();

    // Preferences
    await expect(page).toHaveURL(/preferences/);
    await page.getByRole('combobox').selectOption('any');
    await page.getByRole('button', { name: /complete setup/i }).click();

    // Should land on venues
    await expect(page).toHaveURL(/venues/);
    await expect(page.getByText(/venues near you/i)).toBeVisible();
  });
}); 