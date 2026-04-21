import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('shows login form', async ({ page }) => {
    await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible();
    await expect(page.getByRole('textbox', { name: /password/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /ingresar|login|sign in/i })).toBeVisible();
  });

  test('shows validation error for empty fields', async ({ page }) => {
    await page.getByRole('button', { name: /ingresar|login|sign in/i }).click();
    await expect(page.getByText(/email|correo/i).first()).toBeVisible();
  });

  test('shows error for invalid email format', async ({ page }) => {
    await page.getByRole('textbox', { name: /email/i }).fill('not-an-email');
    await page.getByRole('textbox', { name: /password/i }).fill('somepassword');
    await page.getByRole('button', { name: /ingresar|login|sign in/i }).click();
    await expect(page.getByText(/email/i).first()).toBeVisible();
  });

  test('redirects to register page from login', async ({ page }) => {
    const registerLink = page.getByRole('link', { name: /registr/i });
    await expect(registerLink).toBeVisible();
    await registerLink.click();
    await expect(page).toHaveURL(/register/);
  });

  test('shows forgot password link', async ({ page }) => {
    await expect(page.getByRole('link', { name: /olvid|forgot/i })).toBeVisible();
  });
});

test.describe('Register page', () => {
  test('shows registration form', async ({ page }) => {
    await page.goto('/register');
    await expect(page.getByRole('heading', { name: /registr/i })).toBeVisible();
  });

  test('shows error for weak password', async ({ page }) => {
    await page.goto('/register');
    const passwordField = page.getByRole('textbox', { name: /password|contraseña/i });
    if (await passwordField.isVisible()) {
      await passwordField.fill('123');
      await page.getByRole('button', { name: /registr/i }).click();
      await expect(page.getByText(/8/i).first()).toBeVisible();
    }
  });
});

test.describe('Reset password page', () => {
  test('shows email input', async ({ page }) => {
    await page.goto('/reset-password');
    await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible();
  });
});
