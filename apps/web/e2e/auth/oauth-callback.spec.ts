import { test, expect } from '@playwright/test';
import { mockAuthMe, mockGoogleCallback } from '../fixtures/auth.js';

test.describe('OAuth Callback', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthMe(page, null);
  });

  test('successful callback logs user in', async ({ page }) => {
    await mockGoogleCallback(page, {
      status: 200,
      body: {
        success: true,
        message: 'ok',
        data: {
          user: { id: '1', email: 'google@example.com', fullName: 'Google User' },
          token: 'tok'
        }
      }
    });

    await page.goto('/auth/callback?code=mock-code&state=mock-state');
    await expect(page.getByText('Welcome!')).toBeVisible();
  });

  test('shows access denied error', async ({ page }) => {
    await page.goto('/auth/callback?error=access_denied');
    await expect(page.getByText(/cancelled/i)).toBeVisible();
  });

  test('shows missing params error without code', async ({ page }) => {
    await page.goto('/auth/callback?state=mock-state');
    await expect(page.getByText(/Missing authorization parameters/i)).toBeVisible();
  });

  test('shows missing params error without state', async ({ page }) => {
    await page.goto('/auth/callback?code=mock-code');
    await expect(page.getByText(/Missing authorization parameters/i)).toBeVisible();
  });

  test('shows backend rejection error', async ({ page }) => {
    await mockGoogleCallback(page, {
      status: 400,
      body: { success: false, message: 'Authentication failed', error: 'Authentication failed' }
    });

    await page.goto('/auth/callback?code=mock-code&state=mock-state');
    await expect(page.getByText(/Authentication failed/i)).toBeVisible();
  });

  test('navigates back to sign-in from error', async ({ page }) => {
    await page.goto('/auth/callback?error=access_denied');
    await page.getByRole('link', { name: /Back to sign in/i }).click();
    await page.waitForURL(/.*sign-in/);
  });
});
