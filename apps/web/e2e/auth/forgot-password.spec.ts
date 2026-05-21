import { test, expect } from '@playwright/test';
import { mockAuthMe, mockAuthForgotPassword, waitForHydration } from '../fixtures/auth.js';

test.describe('Forgot Password', () => {
	test.beforeEach(async ({ page }) => {
		await mockAuthMe(page, null);
	});

	test('submits email and shows success message', async ({ page }) => {
		await mockAuthForgotPassword(page, {
			status: 200,
			body: { success: true, message: 'ok' }
		});

		await page.goto('/auth/forgot-password');
		await waitForHydration(page);
		await page.locator('input[type="email"]').fill('user@example.com');
		await page.getByRole('button', { name: /Send reset link/i }).click();

		await expect(page.getByText(/reset link has been sent/i)).toBeVisible();
	});

	test('shows error on server failure', async ({ page }) => {
		await mockAuthForgotPassword(page, {
			status: 500,
			body: { success: false, message: 'Server error', error: 'Server error' }
		});

		await page.goto('/auth/forgot-password');
		await waitForHydration(page);
		await page.locator('input[type="email"]').fill('user@example.com');
		await page.getByRole('button', { name: /Send reset link/i }).click();

		await expect(page.getByText(/Something went wrong/i)).toBeVisible();
	});

	test('navigates back to sign-in', async ({ page }) => {
		await page.goto('/auth/forgot-password');
		await waitForHydration(page);
		await page.getByRole('link', { name: /Already have an account/i }).click();
		await page.waitForURL(/.*sign-in/);
	});
});
