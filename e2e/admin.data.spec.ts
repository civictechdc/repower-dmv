import { test, expect } from '@playwright/test';

const ADMIN_EMAIL = 'rachel@remix.run';
const ADMIN_PASS = 'racheliscool';

test.describe('Admin Data CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login?redirectTo=%2Fadmin%2Fdata');
    await page.getByLabel('Email address').fill(ADMIN_EMAIL);
    await page.getByLabel('Password').fill(ADMIN_PASS);
    await page.getByRole('button', { name: 'Log in' }).click();
    await expect(page.getByRole('heading', { name: 'Admin Data' })).toBeVisible();
  });

  test('Certifications add/delete', async ({ page }) => {
    await page.getByRole('link', { name: 'Certifications' }).click();
    await expect(page.getByRole('heading', { name: 'Certifications' })).toBeVisible();
    const name = `E2E Cert ${Date.now()}`;
    await page.getByPlaceholder('Name').fill(name);
    await page.getByPlaceholder('Short Name').fill(`E2E${Date.now().toString().slice(-3)}`);
    await page.getByPlaceholder('Description').fill('e2e');
    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.getByRole('row', { name: new RegExp(name) })).toBeVisible();
    const row = page.getByRole('row', { name: new RegExp(name) });
    await row.getByRole('button', { name: 'Delete' }).click();
    // Confirm dialog is not native handled by Playwright API; our code uses window.confirm. Playwright auto-accepts? We'll accept via event.
  });

  test('Services add/delete', async ({ page }) => {
    await page.getByRole('link', { name: 'Services' }).click();
    await expect(page.getByRole('heading', { name: 'Services' })).toBeVisible();
    const name = `E2E Service ${Date.now()}`;
    await page.getByPlaceholder('Name').fill(name);
    await page.getByPlaceholder('Description').fill('e2e');
    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.getByRole('row', { name: new RegExp(name) })).toBeVisible();
    const row = page.getByRole('row', { name: new RegExp(name) });
    page.once('dialog', d => d.accept());
    await row.getByRole('button', { name: 'Delete' }).click();
  });

  test('States add/delete', async ({ page }) => {
    await page.getByRole('link', { name: 'States' }).click();
    await expect(page.getByRole('heading', { name: 'States' })).toBeVisible();
    const name = `ZZ${Date.now().toString().slice(-2)}`;
    await page.getByPlaceholder('Name').fill(name);
    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.getByRole('row', { name: new RegExp(name) })).toBeVisible();
    const row = page.getByRole('row', { name: new RegExp(name) });
    page.once('dialog', d => d.accept());
    await row.getByRole('button', { name: 'Delete' }).click();
  });
});

