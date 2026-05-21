import { expect, test } from '@playwright/test';

test('home page redirects unauthenticated users to sign-in', async ({ page }) => {
	await page.goto('/');
	await expect(page).toHaveURL(/.*sign-in/);
});
