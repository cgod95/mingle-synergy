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