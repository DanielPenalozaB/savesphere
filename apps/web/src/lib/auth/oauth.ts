/**
 * PKCE (Proof Key for Code Exchange) utilities for OAuth 2.0.
 */

function base64URLEncode(buffer: ArrayBuffer): string {
	return btoa(String.fromCharCode(...new Uint8Array(buffer)))
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=/g, '');
}

async function sha256(verifier: string): Promise<ArrayBuffer> {
	const encoder = new TextEncoder();
	const data = encoder.encode(verifier);
	return crypto.subtle.digest('SHA-256', data);
}

export async function generatePKCE() {
	const array = new Uint8Array(32);
	crypto.getRandomValues(array);
	const verifier = base64URLEncode(array.buffer);
	const challenge = base64URLEncode(await sha256(verifier));
	return { verifier, challenge };
}

/**
 * Initiate Google OAuth flow.
 * POSTs to backend to get the Google auth URL, then redirects.
 */
export async function startGoogleAuth() {
	const res = await fetch('/api/auth/google', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' }
	});
	const json = await res.json();
	if (!res.ok || !json.success) {
		throw new Error(json.message || 'Failed to start Google authentication');
	}
	const url = json.data?.url as string;
	if (!url) {
		throw new Error('No authorization URL received');
	}
	window.location.href = url;
}
