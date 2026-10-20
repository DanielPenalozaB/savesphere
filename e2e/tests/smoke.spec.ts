import { expect, test } from '@playwright/test';

test('home page renders through SSR with the API reachable', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('heading', { name: 'SaveSphere' })).toBeVisible();
	await expect(page.getByTestId('api-status')).toHaveText('All systems ready');
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
		await page.goto('/');
		await expect(page.getByTestId('api-status')).toHaveText('Todo listo');
	});
});
