import { test, expect, type Page } from '@playwright/test';

async function loginAsAdmin(page: Page) {
  await page.goto('/login');
  await page.getByRole('textbox', { name: /email/i }).fill(process.env.E2E_ADMIN_EMAIL ?? 'admin@panteranegra.com');
  await page.getByRole('textbox', { name: /password/i }).fill(process.env.E2E_ADMIN_PASSWORD ?? 'admin-password');
  await page.getByRole('button', { name: /ingresar|login/i }).click();
  await expect(page).not.toHaveURL(/login/, { timeout: 10_000 });
}

test.describe('Members page (admin)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('shows members list or empty state', async ({ page }) => {
    await page.goto('/');
    // Either members table or empty state message should be visible
    const membersContent = page.locator('table, [data-testid="empty-members"], [class*="members"]');
    await expect(membersContent.first()).toBeVisible({ timeout: 10_000 });
  });

  test('admin can access schedule management', async ({ page }) => {
    await page.goto('/schedule-management');
    await expect(page).not.toHaveURL(/login/);
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10_000 });
  });

  test('admin can access membership plans', async ({ page }) => {
    await page.goto('/admin/membership-plans');
    await expect(page).not.toHaveURL(/login/);
  });
});

test.describe('Protected routes redirect unauthenticated users', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any stored session
    await page.goto('/login');
    await page.evaluate(() => localStorage.clear());
  });

  test('/ redirects to login', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/login/, { timeout: 8_000 });
  });

  test('/schedule redirects to login', async ({ page }) => {
    await page.goto('/schedule');
    await expect(page).toHaveURL(/login/, { timeout: 8_000 });
  });

  test('/portal redirects to login', async ({ page }) => {
    await page.goto('/portal');
    await expect(page).toHaveURL(/login/, { timeout: 8_000 });
  });
});
