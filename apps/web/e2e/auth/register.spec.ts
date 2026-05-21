import { test, expect } from '@playwright/test';
import { mockAuthMe, mockAuthRegister, waitForHydration } from '../fixtures/auth.js';

test.describe('Registration', () => {
	test.beforeEach(async ({ page }) => {
		await mockAuthMe(page, null);
	});

	test('complete registration flow', async ({ page }) => {
		await mockAuthRegister(page, {
			status: 201,
			body: {
				success: true,
				message: 'ok',
				data: { user: { id: '1', email: 'new@example.com', fullName: 'New User' }, token: 'tok' }
			}
		});

		await page.goto('/auth/register');
		await waitForHydration(page);
		await page.locator('input#fullName-s1').fill('New User');
		await page.locator('input#email-s1').fill('new@example.com');
		await page.locator('input#password-s1').fill('Password123');
		await page.locator('input#confirmPassword-s1').fill('Password123');
		await page.getByRole('button', { name: /Create account$/i }).click();

		await page.waitForURL(/\/$/, { timeout: 10000 });
	});

	test('shows validation errors for empty form', async ({ page }) => {
		await page.goto('/auth/register');
		await waitForHydration(page);
		await page.getByRole('button', { name: /Create account$/i }).click();

		await expect(page.getByText('Full name is required')).toBeVisible();
		await expect(page.getByText('Please enter a valid email')).toBeVisible();
	});

	test('rejects full name with digits', async ({ page }) => {
		await page.goto('/auth/register');
		await waitForHydration(page);
		await page.locator('input#fullName-s1').fill('John123');
		await page.locator('input#email-s1').fill('john@example.com');
		await page.locator('input#password-s1').fill('Password123');
		await page.locator('input#confirmPassword-s1').fill('Password123');
		await page.getByRole('button', { name: /Create account$/i }).click();

		await expect(page.getByText(/cannot contain numbers/i)).toBeVisible();
	});

	test('rejects weak password', async ({ page }) => {
		await page.goto('/auth/register');
		await waitForHydration(page);
		await page.locator('input#fullName-s1').fill('John Doe');
		await page.locator('input#email-s1').fill('john@example.com');
		await page.locator('input#password-s1').fill('weak');
		await page.locator('input#confirmPassword-s1').fill('weak');
		await page.getByRole('button', { name: /Create account$/i }).click();

		await expect(page.getByText(/must be at least 8 characters/i)).toBeVisible();
	});

	test('rejects mismatched passwords', async ({ page }) => {
		await page.goto('/auth/register');
		await waitForHydration(page);
		await page.locator('input#fullName-s1').fill('John Doe');
		await page.locator('input#email-s1').fill('john@example.com');
		await page.locator('input#password-s1').fill('Password123');
		await page.locator('input#confirmPassword-s1').fill('Password124');
		await page.getByRole('button', { name: /Create account$/i }).click();

		await expect(page.getByText(/Passwords do not match/i)).toBeVisible();
	});

	test('shows already exists error on 409', async ({ page }) => {
		await mockAuthRegister(page, {
			status: 409,
			body: { success: false, message: 'Conflict', error: 'Conflict' }
		});

		await page.goto('/auth/register');
		await waitForHydration(page);
		await page.locator('input#fullName-s1').fill('John Doe');
		await page.locator('input#email-s1').fill('existing@example.com');
		await page.locator('input#password-s1').fill('Password123');
		await page.locator('input#confirmPassword-s1').fill('Password123');
		await page.getByRole('button', { name: /Create account$/i }).click();

		await expect(page.getByText(/already exists/i)).toBeVisible();
	});

	test('navigates to sign-in page', async ({ page }) => {
		await page.goto('/auth/register');
		await page.getByRole('link', { name: /Sign in/i }).click();
		await page.waitForURL(/.*sign-in/);
	});

	test('shows password strength indicator', async ({ page }) => {
		await page.goto('/auth/register');
		await page.locator('input#password-s1').fill('Pass');
		await expect(page.getByText('Weak')).toBeVisible();
	});

	test('toggles password visibility', async ({ page }) => {
		await page.goto('/auth/register');
		await waitForHydration(page);
		const passwordInput = page.locator('input#password-s1');
		await passwordInput.fill('secret');
		await expect(passwordInput).toHaveAttribute('type', 'password');

		// Click the toggle button inside the password field wrapper
		await page.locator('input#password-s1').locator('xpath=../button').click();
		await expect(passwordInput).toHaveAttribute('type', 'text');
	});
});
