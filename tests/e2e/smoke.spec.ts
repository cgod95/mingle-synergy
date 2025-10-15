import { test, expect } from '@playwright/test';

test('root serves and renders', async ({ page, request, baseURL }) => {
  const res = await request.get(baseURL! + '/');
  expect(res.ok()).toBeTruthy();
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');
  await expect(page).toHaveURL(/\/?/);
});

test('app shell loads without console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');
  expect(errors).toEqual([]);
});
