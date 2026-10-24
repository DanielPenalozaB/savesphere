import type { RequestEvent } from '@sveltejs/kit';

/** Better Auth error codes the auth screens turn into friendly messages. */
export type AuthErrorCode = 'invalid_credentials' | 'email_taken' | 'weak_password' | 'unknown';

const CODE_MAP: Record<string, AuthErrorCode> = {
	INVALID_EMAIL_OR_PASSWORD: 'invalid_credentials',
	USER_ALREADY_EXISTS: 'email_taken',
	USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: 'email_taken',
	PASSWORD_TOO_SHORT: 'weak_password',
	PASSWORD_TOO_LONG: 'weak_password'
};

export function toAuthErrorCode(apiCode: string | undefined): AuthErrorCode {
	return CODE_MAP[apiCode ?? ''] ?? 'unknown';
}

/**
 * Calls a Better Auth endpoint through `event.fetch`, so the request goes through the /api proxy
 * and the session cookie it sets is forwarded to the browser. Returns an error code on failure.
 */
export async function callAuth(
	event: Pick<RequestEvent, 'fetch' | 'url'>,
	path: '/sign-in/email' | '/sign-up/email' | '/sign-out',
	body: Record<string, string> = {}
): Promise<AuthErrorCode | null> {
	try {
		const response = await event.fetch(`/api/auth${path}`, {
			method: 'POST',
			// Better Auth rejects cookie-bearing POSTs from origins it doesn't trust.
			headers: { 'content-type': 'application/json', origin: event.url.origin },
			body: JSON.stringify(body)
		});
		if (response.ok) return null;
		// Better Auth answers with `{ code, message }`, not the API envelope.
		const payload = (await response.json().catch(() => null)) as { code?: string } | null;
		return toAuthErrorCode(payload?.code);
	} catch {
		return 'unknown';
	}
}

export function formString(data: FormData, name: string): string {
	const value = data.get(name);
	return typeof value === 'string' ? value : '';
}
