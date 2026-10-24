import { expect, test } from '@playwright/test';

test('signed-out visitors land on the sign-in page (SSR guard)', async ({ page }) => {
	await page.goto('/');
	await expect(page).toHaveURL('/login');
	await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
});

test('serves the PWA manifest and service worker', async ({ request }) => {
	const manifest = await request.get('/manifest.webmanifest');
	expect(manifest.ok()).toBe(true);
	expect(await manifest.json()).toMatchObject({ name: 'SaveSphere', display: 'standalone' });
	expect((await request.get('/service-worker.js')).ok()).toBe(true);
});

test.describe('in Spanish', () => {
	test.use({ locale: 'es-ES' });

	test('follows the browser language', async ({ page }) => {
		await page.goto('/login');
		await expect(page.getByRole('heading', { name: 'Bienvenido de nuevo' })).toBeVisible();
	});
});
