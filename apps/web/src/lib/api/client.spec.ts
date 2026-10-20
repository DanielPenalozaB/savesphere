import { describe, expect, it, vi } from 'vitest';
import { ApiError, createApiClient } from './client';

const respond = (status: number, body: unknown) =>
	vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status }));

describe('createApiClient', () => {
	it('unwraps the success envelope and prefixes /api', async () => {
		const fetchFn = respond(200, { success: true, data: { status: 'ok' } });
		await expect(createApiClient(fetchFn).get('/health')).resolves.toEqual({ status: 'ok' });
		expect(fetchFn).toHaveBeenCalledWith('/api/health', expect.objectContaining({ method: 'GET' }));
	});

	it('sends JSON bodies', async () => {
		const fetchFn = respond(201, { success: true, data: { id: '1' } });
		await createApiClient(fetchFn).post('/accounts', { name: 'Wallet' });
		const [, init] = fetchFn.mock.calls[0]!;
		expect(init).toMatchObject({
			body: '{"name":"Wallet"}',
			headers: { 'content-type': 'application/json' }
		});
	});

	it('throws a typed ApiError for the failure envelope', async () => {
		const fetchFn = respond(403, {
			success: false,
			error: {
				code: 'AI_NOT_CONFIGURED',
				message: 'Connect an AI provider',
				details: { reason: 'not_configured' }
			}
		});
		const error = await createApiClient(fetchFn)
			.post('/ai/parse-transaction', { text: 'x' })
			.catch((e) => e);
		expect(error).toBeInstanceOf(ApiError);
		expect(error).toMatchObject({
			code: 'AI_NOT_CONFIGURED',
			status: 403,
			details: { reason: 'not_configured' }
		});
	});

	it('handles non-JSON responses', async () => {
		const fetchFn = vi.fn().mockResolvedValue(new Response('Bad gateway', { status: 502 }));
		await expect(createApiClient(fetchFn).get('/health')).rejects.toMatchObject({
			code: 'INTERNAL_ERROR',
			status: 502
		});
	});
});
