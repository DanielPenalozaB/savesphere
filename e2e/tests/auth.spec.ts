import { randomUUID } from 'node:crypto';
import { devices, expect, test } from '@playwright/test';

const password = 'correct-horse-battery';
const newEmail = () => `e2e-${randomUUID()}@test.savesphere.app`;

test('sign up, sign out and sign back in', async ({ page }) => {
	const email = newEmail();

	await page.goto('/signup');
	await page.getByLabel('Name').fill('Ada Lovelace');
	await page.getByLabel('Email').fill(email);
	await page.getByLabel('Password', { exact: true }).fill(password);
	await page.getByRole('button', { name: 'Create account' }).click();

	await expect(page).toHaveURL('/');
	await expect(page.getByRole('heading', { name: 'Hi, Ada' })).toBeVisible();

	await page.getByLabel('Account', { exact: true }).click();
	await page.getByRole('button', { name: 'Sign out' }).click();
	await expect(page).toHaveURL('/login');

	await page.getByLabel('Email').fill(email);
	await page.getByLabel('Password', { exact: true }).fill('not-the-password');
	await page.getByRole('button', { name: 'Sign in' }).click();
	await expect(page.getByRole('alert')).toHaveText(/don't match/);
	await expect(page.getByLabel('Email')).toHaveValue(email);

	await page.getByLabel('Password', { exact: true }).fill(password);
	await page.getByRole('button', { name: 'Sign in' }).click();
	await expect(page.getByRole('heading', { name: 'Hi, Ada' })).toBeVisible();
});

test('signing up twice with the same email explains what to do', async ({ page, request }) => {
	const email = newEmail();
	const first = await request.post('/api/auth/sign-up/email', {
		data: { email, password, name: 'First' }
	});
	expect(first.ok()).toBe(true);

	await page.goto('/signup');
	await page.getByLabel('Name').fill('Second');
	await page.getByLabel('Email').fill(email);
	await page.getByLabel('Password', { exact: true }).fill(password);
	await page.getByRole('button', { name: 'Create account' }).click();
	await expect(page.getByRole('alert')).toHaveText(/already exists/);
});

test.describe('on a phone', () => {
	// Not the whole device preset: its browser type can't be switched inside a describe block.
	const { viewport, deviceScaleFactor, isMobile, hasTouch, userAgent } = devices['Pixel 7'];
	test.use({ viewport, deviceScaleFactor, isMobile, hasTouch, userAgent });

	test('navigates with the bottom bar and the "More" drawer', async ({ page }) => {
		await page.goto('/signup');
		await page.getByLabel('Name').fill('Mobile User');
		await page.getByLabel('Email').fill(newEmail());
		await page.getByLabel('Password', { exact: true }).fill(password);
		await page.getByRole('button', { name: 'Create account' }).click();
		await expect(page.getByRole('heading', { name: 'Hi, Mobile' })).toBeVisible();

		await page.getByRole('link', { name: 'Activity' }).click();
		await expect(page).toHaveURL('/activity');
		await expect(page.getByRole('heading', { name: 'Activity', level: 1 })).toBeVisible();

		await page.getByRole('button', { name: 'More' }).click();
		await page.getByRole('dialog').getByRole('link', { name: 'Insights' }).click();
		await expect(page).toHaveURL('/insights');
		await expect(page.getByRole('dialog')).toBeHidden();
	});
});
