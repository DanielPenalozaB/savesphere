import { userAiCredentials } from '@savesphere/db';
import { eq } from 'drizzle-orm';
import { createTestApp, signUp, type TestApp } from './helpers/app.js';

const API_KEY = 'sk-test-1234567890abcd';

describe('optional AI', () => {
	let t: TestApp;
	beforeAll(async () => {
		t = await createTestApp();
	});
	afterAll(() => t.close());

	it('reports AI as not configured and locks AI-only endpoints', async () => {
		const { agent } = await signUp(t.app);
		const capabilities = await agent.get('/api/me/capabilities').expect(200);
		expect(capabilities.body.data.ai).toEqual({
			available: false,
			reason: 'not_configured',
			source: null
		});

		const locked = await agent
			.post('/api/ai/parse-transaction')
			.send({ text: 'lunch 12.50' })
			.expect(403);
		expect(locked.body.error).toMatchObject({
			code: 'AI_NOT_CONFIGURED',
			details: { reason: 'not_configured' }
		});
	});

	it('rejects keys the provider does not accept', async () => {
		const { agent } = await signUp(t.app);
		await agent
			.put('/api/ai/credentials')
			.send({ provider: 'anthropic', apiKey: 'invalid-key-000000' })
			.expect(422);
	});

	it('stores keys encrypted, never returns them, and unlocks AI features', async () => {
		const { agent, userId } = await signUp(t.app);
		const saved = await agent
			.put('/api/ai/credentials')
			.send({ provider: 'anthropic', apiKey: API_KEY })
			.expect(200);
		expect(saved.body.data).toMatchObject({
			provider: 'anthropic',
			keyHint: '••••abcd',
			isPrimary: true,
			status: 'active'
		});
		expect(JSON.stringify(saved.body)).not.toContain(API_KEY);

		const [row] = await t.db.db
			.select()
			.from(userAiCredentials)
			.where(eq(userAiCredentials.userId, userId));
		expect(row!.ciphertext.toString('utf8')).not.toContain(API_KEY);

		const capabilities = await agent.get('/api/me/capabilities').expect(200);
		expect(capabilities.body.data.ai).toEqual({ available: true, reason: null, source: 'user' });

		const parsed = await agent
			.post('/api/ai/parse-transaction')
			.send({ text: 'Dining Out lunch 12.50' })
			.expect(200);
		expect(parsed.body.data).toMatchObject({ kind: 'expense', amountMinor: 1250 });
		expect(parsed.body.data.categoryId).not.toBeNull();
	});

	it('respects the user opt-out even with a valid key', async () => {
		const { agent } = await signUp(t.app);
		await agent
			.put('/api/ai/credentials')
			.send({ provider: 'openai', apiKey: API_KEY })
			.expect(200);
		await agent.patch('/api/me/settings').send({ aiEnabled: false }).expect(200);

		const locked = await agent
			.post('/api/ai/parse-transaction')
			.send({ text: 'coffee 3' })
			.expect(403);
		expect(locked.body.error.details).toEqual({ reason: 'disabled_by_user' });
	});

	it('removes credentials and locks AI again', async () => {
		const { agent } = await signUp(t.app);
		const saved = await agent
			.put('/api/ai/credentials')
			.send({ provider: 'google', apiKey: API_KEY })
			.expect(200);
		await agent.delete(`/api/ai/credentials/${saved.body.data.id}`).expect(200);
		const capabilities = await agent.get('/api/me/capabilities').expect(200);
		expect(capabilities.body.data.ai.available).toBe(false);
	});

	it('falls back to the instance key when the user has none', async () => {
		const instance = await createTestApp({
			INSTANCE_AI_PROVIDER: 'anthropic',
			INSTANCE_AI_KEY: API_KEY
		});
		try {
			const { agent } = await signUp(instance.app);
			const capabilities = await agent.get('/api/me/capabilities').expect(200);
			expect(capabilities.body.data.ai).toEqual({
				available: true,
				reason: null,
				source: 'instance'
			});
			await agent.post('/api/ai/parse-transaction').send({ text: 'salary 2000' }).expect(200);
		} finally {
			await instance.close();
		}
	});
});

describe('optional chat channels', () => {
	it('offers only the channels the instance has credentials for', async () => {
		const t = await createTestApp({ TELEGRAM_BOT_TOKEN: '123:abc' });
		try {
			const { agent } = await signUp(t.app);
			const capabilities = await agent.get('/api/me/capabilities').expect(200);
			expect(capabilities.body.data.channels).toEqual({
				telegram: { available: true, linked: false, reason: null },
				whatsapp: { available: false, linked: false, reason: 'not_configured' }
			});
		} finally {
			await t.close();
		}
	});
});
