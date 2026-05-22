import { test, expect } from '@playwright/test';
import { mockAuthMe, mockAuthResetPassword, waitForHydration } from '../fixtures/auth.js';

test.describe('Reset Password', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthMe(page, null);
  });

  test('resets password with valid token', async ({ page }) => {
    await mockAuthResetPassword(page, {
      status: 200,
      body: { success: true, message: 'ok' }
    });

    await page.goto('/auth/reset-password?token=valid-token');
    await waitForHydration(page);
    await page.getByLabel('Password', { exact: true }).fill('NewPass123');
    await page.getByLabel('Confirm password').fill('NewPass123');
    await page.getByRole('button', { name: /Update password/i }).click();

    await page.waitForURL(/.*sign-in/, { timeout: 10000 });
  });

  test('shows missing token error on submit', async ({ page }) => {
    await page.goto('/auth/reset-password');
    await waitForHydration(page);
    await page.getByLabel('Password', { exact: true }).fill('Password123');
    await page.getByLabel('Confirm password').fill('Password123');
    await page.getByRole('button', { name: /Update password/i }).click();

    await expect(page.getByText(/Missing reset token/i)).toBeVisible();
  });

  test('rejects short password', async ({ page }) => {
    await page.goto('/auth/reset-password?token=valid-token');
    await waitForHydration(page);
    await page.getByLabel('Password', { exact: true }).fill('short');
    await page.getByLabel('Confirm password').fill('short');
    await page.getByRole('button', { name: /Update password/i }).click();

    await expect(page.getByText(/must be at least 8 characters/i)).toBeVisible();
  });

  test('rejects mismatched passwords', async ({ page }) => {
    await page.goto('/auth/reset-password?token=valid-token');
    await waitForHydration(page);
    await page.getByLabel('Password', { exact: true }).fill('Password123');
    await page.getByLabel('Confirm password').fill('Password124');
    await page.getByRole('button', { name: /Update password/i }).click();

    await expect(page.getByText(/Passwords do not match/i)).toBeVisible();
  });

  test('shows invalid token error from API', async ({ page }) => {
    await mockAuthResetPassword(page, {
      status: 400,
      body: { success: false, message: 'Invalid token', error: 'Invalid token' }
    });

    await page.goto('/auth/reset-password?token=invalid-token');
    await waitForHydration(page);
    await page.getByLabel('Password', { exact: true }).fill('Password123');
    await page.getByLabel('Confirm password').fill('Password123');
    await page.getByRole('button', { name: /Update password/i }).click();

    await expect(page.getByText(/Invalid or expired token/i)).toBeVisible();
  });

  test('toggles password visibility', async ({ page }) => {
    await page.goto('/auth/reset-password?token=valid-token');
    await waitForHydration(page);
    const passwordInput = page.locator('input#password');
    await passwordInput.fill('secret');
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Click the toggle button inside the password field wrapper
    await page.locator('input#password').locator('xpath=../button').click();
    await expect(passwordInput).toHaveAttribute('type', 'text');
  });
});
