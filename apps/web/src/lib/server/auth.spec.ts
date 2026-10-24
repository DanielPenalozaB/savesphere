import { describe, expect, it, vi } from 'vitest';
import { callAuth, toAuthErrorCode } from './auth.ts';

function eventWith(fetchFn: typeof fetch) {
	return { fetch: fetchFn, url: new URL('https://savesphere.test/login') };
}

describe('toAuthErrorCode', () => {
	it.each([
		['INVALID_EMAIL_OR_PASSWORD', 'invalid_credentials'],
		['USER_ALREADY_EXISTS', 'email_taken'],
		['USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL', 'email_taken'],
		['PASSWORD_TOO_SHORT', 'weak_password'],
		['SOMETHING_NEW', 'unknown'],
		[undefined, 'unknown']
	])('maps %s to %s', (apiCode, code) => {
		expect(toAuthErrorCode(apiCode)).toBe(code);
	});
});

describe('callAuth', () => {
	it('posts JSON with the app origin to the Better Auth endpoint', async () => {
		const fetchFn = vi.fn<typeof fetch>(async () => Response.json({ token: 't' }));
		const body = { email: 'a@b.co', password: 'secret-secret' };

		await expect(callAuth(eventWith(fetchFn), '/sign-in/email', body)).resolves.toBeNull();

		const [url, init] = fetchFn.mock.calls[0]!;
		expect(url).toBe('/api/auth/sign-in/email');
		expect(init?.method).toBe('POST');
		expect(init?.headers).toMatchObject({ origin: 'https://savesphere.test' });
		expect(JSON.parse(init!.body as string)).toEqual(body);
	});

	it('returns the mapped error code when Better Auth rejects the request', async () => {
		const fetchFn = vi.fn<typeof fetch>(async () =>
			Response.json({ code: 'USER_ALREADY_EXISTS', message: 'x' }, { status: 422 })
		);
		await expect(callAuth(eventWith(fetchFn), '/sign-up/email')).resolves.toBe('email_taken');
	});

	it('reports network failures as unknown', async () => {
		const fetchFn = vi.fn<typeof fetch>().mockRejectedValue(new TypeError('offline'));
		await expect(callAuth(eventWith(fetchFn), '/sign-out')).resolves.toBe('unknown');
	});
});
