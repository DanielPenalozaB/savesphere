import { test, expect } from '@playwright/test';
import { mockAuthMe, mockAuthLogout, MOCK_USER } from '../fixtures/auth.js';

test.describe('Auth Guards', () => {
	test('unauthenticated user redirected from dashboard to sign-in', async ({ page }) => {
		await mockAuthMe(page, null);
		// Use domcontentloaded to avoid waiting for all resources on a page that redirects
		await page.goto('/', { waitUntil: 'domcontentloaded' });
		await page.waitForURL(/.*sign-in/, { timeout: 10000 });
	});

	test('unauthenticated user redirected from wallets to sign-in', async ({ page }) => {
		await mockAuthMe(page, null);
		await page.goto('/wallets', { waitUntil: 'domcontentloaded' });
		await page.waitForURL(/.*sign-in/, { timeout: 10000 });
	});

	test('authenticated user redirected from auth pages to dashboard', async ({ page }) => {
		await mockAuthMe(page, MOCK_USER);
		await page.goto('/auth/register', { waitUntil: 'domcontentloaded' });
		await page.waitForURL(/\/$/, { timeout: 10000 });
	});

	test('authenticated user redirected from sign-in to dashboard', async ({ page }) => {
		await mockAuthMe(page, MOCK_USER);
		await page.goto('/auth/sign-in', { waitUntil: 'domcontentloaded' });
		await page.waitForURL(/\/$/, { timeout: 10000 });
	});

	test('dashboard visible for authenticated user', async ({ page }) => {
		await mockAuthMe(page, MOCK_USER);
		await page.goto('/');
		await expect(page.locator('h1').first()).toBeVisible();
	});

	test('logout flow redirects to sign-in', async ({ page }) => {
		await mockAuthMe(page, MOCK_USER);
		await mockAuthLogout(page);

		await page.goto('/');
		// Open user menu in sidebar and click logout
		await page.getByRole('button', { name: /Test User/i }).click();
		await page.getByRole('menuitem', { name: /Log out/i }).click();

		await page.waitForURL(/.*sign-in/, { timeout: 10000 });
	});
});
