import { test, expect } from '@playwright/test';

test('home page renders and healthcheck OK', async ({ page, request }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Home/i);
  const res = await request.get('/healthcheck');
  expect(res.status()).toBe(200);
  expect(await res.text()).toContain('OK');
});

