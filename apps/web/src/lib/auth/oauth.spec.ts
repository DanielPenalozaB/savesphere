import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generatePKCE, startGoogleAuth } from './oauth.js';

describe('generatePKCE', () => {
	it('produces a verifier of correct length and format', async () => {
		const { verifier } = await generatePKCE();
		expect(verifier.length).toBe(43);
		expect(verifier).toMatch(/^[A-Za-z0-9_-]+$/);
		expect(verifier).not.toContain('+');
		expect(verifier).not.toContain('/');
		expect(verifier).not.toContain('=');
	});

	it('produces a challenge from SHA-256 of verifier', async () => {
		const { verifier, challenge } = await generatePKCE();
		expect(challenge.length).toBe(43);
		expect(challenge).toMatch(/^[A-Za-z0-9_-]+$/);
		// Challenge should be deterministic for same verifier
		const encoder = new TextEncoder();
		const data = encoder.encode(verifier);
		const hashBuffer = await crypto.subtle.digest('SHA-256', data);
		const expectedChallenge = btoa(String.fromCharCode(...new Uint8Array(hashBuffer)))
			.replace(/\+/g, '-')
			.replace(/\//g, '_')
			.replace(/=/g, '');
		expect(challenge).toBe(expectedChallenge);
	});

	it('generates unique values on multiple calls', async () => {
		const first = await generatePKCE();
		const second = await generatePKCE();
		expect(first.verifier).not.toBe(second.verifier);
		expect(first.challenge).not.toBe(second.challenge);
	});
});

describe('startGoogleAuth', () => {
	let fetchMock: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		fetchMock = vi.fn();
		global.fetch = fetchMock;
		// Mock window.location for Node environment
		Object.defineProperty(globalThis, 'window', {
			value: { location: { href: '' } },
			writable: true,
			configurable: true
		});
		Object.defineProperty(globalThis, 'location', {
			value: { href: '' },
			writable: true,
			configurable: true
		});
	});

	it('redirects to the auth URL on success', async () => {
		fetchMock.mockResolvedValue({
			ok: true,
			json: () =>
				Promise.resolve({
					success: true,
					data: { url: 'https://accounts.google.com/o/oauth2/auth?client_id=123' }
				})
		});

		await startGoogleAuth();
		expect(window.location.href).toBe('https://accounts.google.com/o/oauth2/auth?client_id=123');
	});

	it('throws when API returns error', async () => {
		fetchMock.mockResolvedValue({
			ok: false,
			status: 500,
			json: () => Promise.resolve({ success: false, message: 'Server error' })
		});

		await expect(startGoogleAuth()).rejects.toThrow('Server error');
	});

	it('throws when success but no URL in response', async () => {
		fetchMock.mockResolvedValue({
			ok: true,
			json: () => Promise.resolve({ success: true, data: {} })
		});

		await expect(startGoogleAuth()).rejects.toThrow('No authorization URL received');
	});

	it('throws on network failure', async () => {
		fetchMock.mockRejectedValue(new Error('Network failure'));
		// Network errors propagate directly from fetch; they are not wrapped
		await expect(startGoogleAuth()).rejects.toThrow('Network failure');
	});
});
