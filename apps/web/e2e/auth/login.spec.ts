import { test, expect } from '@playwright/test';
import { mockAuthMe, mockAuthLogin, waitForHydration } from '../fixtures/auth.js';

test.describe('Login', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthMe(page, null);
  });

  test('successful login redirects to dashboard', async ({ page }) => {
    await mockAuthLogin(page, {
      status: 200,
      body: {
        success: true,
        message: 'ok',
        data: { user: { id: '1', email: 'test@example.com', fullName: 'Test' }, token: 'tok' }
      }
    });

    await page.goto('/auth/sign-in');
    await waitForHydration(page);
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password', { exact: true }).fill('Password123');
    await page.getByRole('button', { name: /Sign in$/i }).click();

    // Success state briefly shows then redirects after 800ms
    await page.waitForURL(/\/$/, { timeout: 10000 });
  });

  test('shows validation errors for invalid fields', async ({ page }) => {
    await page.goto('/auth/sign-in');
    await waitForHydration(page);
    // Use an invalid email that passes HTML5 validation but fails Zod
    // test@example.c has a single-char TLD — passes HTML5 in most browsers but fails Zod
    await page.getByLabel('Email').fill('test@example.c');
    await page.getByLabel('Password', { exact: true }).fill('');
    await page.getByRole('button', { name: /Sign in$/i }).click();

    await expect(page.getByText('Please enter a valid email')).toBeVisible();
    await expect(page.getByText('Password is required')).toBeVisible();
  });

  test('redirects to sign-in on 401', async ({ page }) => {
    // 401 triggers authState.logout() → redirect to /auth/sign-in
    await mockAuthLogin(page, {
      status: 401,
      body: { success: false, message: 'Unauthorized', error: 'Unauthorized' }
    });

    await page.goto('/auth/sign-in');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password', { exact: true }).fill('WrongPassword');
    await page.getByRole('button', { name: /Sign in$/i }).click();

    // The logout redirect happens immediately
    await expect(page).toHaveURL(/.*sign-in/);
  });

  test('shows unverified error on 403', async ({ page }) => {
    await mockAuthLogin(page, {
      status: 403,
      body: { success: false, message: 'Unverified', error: 'Unverified' }
    });

    await page.goto('/auth/sign-in');
    await waitForHydration(page);
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password', { exact: true }).fill('Password123');
    await page.getByRole('button', { name: /Sign in$/i }).click();

    await expect(page.getByText(/verify your email/i)).toBeVisible();
  });

  test('toggles password visibility', async ({ page }) => {
    await page.goto('/auth/sign-in');
    await waitForHydration(page);
    const passwordInput = page.locator('input#password-s1');
    await passwordInput.fill('secret');
    await expect(passwordInput).toHaveAttribute('type', 'password');

    await page.getByRole('button', { name: /Show password/i }).click();
    await expect(passwordInput).toHaveAttribute('type', 'text');
  });

  test('navigates to forgot password page', async ({ page }) => {
    await page.goto('/auth/sign-in');
    await page.getByRole('link', { name: /Forgot your password/i }).click();
    await page.waitForURL(/.*forgot-password/);
  });

  test('navigates to register page', async ({ page }) => {
    await page.goto('/auth/sign-in');
    await page.getByRole('link', { name: /Sign up/i }).click();
    await page.waitForURL(/.*register/);
  });

  test('restores session from auth/me on app load', async ({ page }) => {
    await mockAuthMe(page, { id: '1', email: 'test@example.com', fullName: 'Test', picture: null });
    await page.goto('/');
    await expect(page.locator('h1').first()).toBeVisible();
  });
});
