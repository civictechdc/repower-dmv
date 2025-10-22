import { test, expect } from '@playwright/test';
const ADMIN_EMAIL = 'rachel@remix.run';
const ADMIN_PASS = 'racheliscool';

test.describe('Admin Contractors', () => {
  test('login and view contractors admin UI', async ({ page }) => {
    await page.goto('/login?redirectTo=%2Fadmin%2Fcontractors');
    await page.getByLabel('Email address').fill(ADMIN_EMAIL);
    await page.getByLabel('Password').fill(ADMIN_PASS);
    await page.getByRole('button', { name: 'Log in' }).click();

    await expect(page.getByRole('heading', { name: 'Contractors Admin' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Bulk Update Google Data' })).toBeVisible();

    const rows = page.locator('tbody tr');
    await expect(rows.first()).toBeVisible();
    // Check status and Google column exist in first row
    const firstRow = rows.first();
    await expect(firstRow.locator('td').nth(3)).toHaveText(/Enabled|Disabled/);
    await expect(firstRow.getByPlaceholder('place_id')).toBeVisible();
  });
});


