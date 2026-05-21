import { test, expect } from '@playwright/test';
import { mockAuthMe, mockAuthVerifyEmail, waitForHydration } from '../fixtures/auth.js';

test.describe('Verify Email', () => {
	test.beforeEach(async ({ page }) => {
		await mockAuthMe(page, null);
	});

	test('verifies email with valid token', async ({ page }) => {
		await mockAuthVerifyEmail(page, {
			status: 200,
			body: { success: true, message: 'ok' }
		});

		await page.goto('/auth/verify-email?token=valid-token');
		await waitForHydration(page);
		// Wait for the async onMount API call to complete
		await page.waitForSelector('text=/Email verified/', { timeout: 10000 });
		// Use heading to avoid strict mode violation (matches both heading and paragraph)
		await expect(page.getByRole('heading', { name: /Email verified/i })).toBeVisible();
	});

	test('shows missing token error', async ({ page }) => {
		await page.goto('/auth/verify-email');
		await waitForHydration(page);
		await expect(page.getByText(/Missing verification token/i)).toBeVisible();
	});

	test('shows invalid token error', async ({ page }) => {
		await mockAuthVerifyEmail(page, {
			status: 400,
			body: { success: false, message: 'Invalid token', error: 'Invalid token' }
		});

		await page.goto('/auth/verify-email?token=invalid-token');
		await waitForHydration(page);
		await page.waitForSelector('text=/Invalid or expired/', { timeout: 10000 });
		await expect(page.getByText(/Invalid or expired/i)).toBeVisible();
	});

	test('navigates back to sign-in from error', async ({ page }) => {
		await page.goto('/auth/verify-email');
		await waitForHydration(page);
		await page.getByRole('link', { name: /Back to sign in/i }).click();
		await page.waitForURL(/.*sign-in/);
	});
});
