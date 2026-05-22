import type { Page } from '@playwright/test';

export const MOCK_USER = {
  id: 'test-user-id',
  email: 'test@example.com',
  fullName: 'Test User',
  picture: null
};

/**
 * Wait for SvelteKit client-side hydration to complete.
 * Tests that click immediately after page load can fail if event listeners
 * haven't been attached yet. A small delay gives hydration time to finish.
 */
export async function waitForHydration(page: Page) {
  await page.waitForTimeout(500);
}

/**
 * Only intercept fetch/XHR requests, not the initial page navigation.
 * This prevents page.route from returning JSON when the browser loads the HTML document.
 */
async function interceptApi(
  page: Page,
  urlPattern: string,
  response: { status: number; body: object }
) {
  await page.route(urlPattern, async (route) => {
    // Let the initial document navigation through
    if (route.request().resourceType() === 'document') {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: response.status,
      contentType: 'application/json',
      body: JSON.stringify(response.body)
    });
  });
}

export async function mockAuthMe(page: Page, user: typeof MOCK_USER | null = MOCK_USER) {
  await page.route('/api/auth/me', async (route) => {
    if (route.request().resourceType() === 'document') {
      await route.continue();
      return;
    }
    if (user) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, message: 'ok', data: user })
      });
    } else {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, message: 'Unauthorized' })
      });
    }
  });
}

export async function mockAuthLogin(page: Page, response: { status: number; body: object }) {
  await interceptApi(page, '/api/auth/login', response);
}

export async function mockAuthRegister(page: Page, response: { status: number; body: object }) {
  await interceptApi(page, '/api/auth/register', response);
}

export async function mockAuthLogout(page: Page) {
  await interceptApi(page, '/api/auth/logout', {
    status: 200,
    body: { success: true, message: 'ok' }
  });
}

export async function mockAuthForgotPassword(
  page: Page,
  response: { status: number; body: object }
) {
  await interceptApi(page, '/api/auth/forgot-password', response);
}

export async function mockAuthResetPassword(
  page: Page,
  response: { status: number; body: object }
) {
  await interceptApi(page, '/api/auth/reset-password', response);
}

export async function mockAuthVerifyEmail(page: Page, response: { status: number; body: object }) {
  await interceptApi(page, '/api/auth/verify-email**', response);
}

export async function mockGoogleCallback(page: Page, response: { status: number; body: object }) {
  await interceptApi(page, '/api/auth/google/callback**', response);
}

export async function mockGoogleAuthInit(page: Page) {
  await interceptApi(page, '/api/auth/google', {
    status: 200,
    body: {
      success: true,
      message: 'ok',
      data: { url: 'https://accounts.google.com/o/oauth2/auth?mock=true' }
    }
  });
}
