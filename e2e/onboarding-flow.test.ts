import { test, expect } from '@playwright/test';

test.describe('Onboarding Flow E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display welcome message on onboarding start', async ({ page }) => {
    // Navigate to onboarding email step
    await page.goto('/onboarding/email');
    
    await expect(page.getByText('Welcome to Mingle')).toBeVisible();
    await expect(page.getByText("Let's get started with your profile")).toBeVisible();
    await expect(page.getByRole('button', { name: /continue/i })).toBeVisible();
  });

  test('should display profile form on profile step', async ({ page }) => {
    // Navigate to profile step
    await page.goto('/create-profile');
    
    await expect(page.getByText('Create Your Profile')).toBeVisible();
    await expect(page.getByText('Name')).toBeVisible();
    await expect(page.getByText('Age')).toBeVisible();
    await expect(page.getByRole('button', { name: /continue/i })).toBeVisible();
  });

  test('should display photo upload interface', async ({ page }) => {
    // Navigate to photo upload step
    await page.goto('/upload-photos');
    
    await expect(page.getByText('Upload Your Photos')).toBeVisible();
    await expect(page.getByText(/Add some photos to your profile/)).toBeVisible();
  });

  test('should display preferences selection', async ({ page }) => {
    // Navigate to preferences step
    await page.goto('/preferences');
    
    await expect(page.getByText('Set Your Preferences')).toBeVisible();
    await expect(page.getByText("Tell us what you're looking for")).toBeVisible();
  });
}); 