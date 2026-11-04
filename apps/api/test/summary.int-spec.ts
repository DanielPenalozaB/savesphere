import { createTestApp, signUp, type Agent, type TestApp } from './helpers/app.js';

async function createAccount(agent: Agent, name: string, currency: string) {
	const response = await agent
		.post('/api/accounts')
		.send({ name, kind: 'checking', currency, openingBalanceMinor: 500_000 })
		.expect(201);
	return response.body.data.id as string;
}

async function categoryId(agent: Agent, kind: 'expense' | 'income') {
	const response = await agent.get('/api/categories').expect(200);
	return (response.body.data as { id: string; kind: string }[]).find((c) => c.kind === kind)!.id;
}

describe('GET /api/transactions/summary', () => {
	let t: TestApp;
	beforeAll(async () => {
		t = await createTestApp();
	});
	afterAll(() => t.close());

	it('sums income and expenses in the period per currency, counting every movement in it', async () => {
		const { agent } = await signUp(t.app);
		const cop = await createAccount(agent, 'Bancolombia', 'COP');
		const copSavings = await createAccount(agent, 'Savings', 'COP');
		const usd = await createAccount(agent, 'Travel card', 'USD');
		const expense = await categoryId(agent, 'expense');
		const income = await categoryId(agent, 'income');

		const record = (body: Record<string, unknown>) =>
			agent.post('/api/transactions').send(body).expect(201);
		await record({
			kind: 'income',
			accountId: cop,
			categoryId: income,
			amountMinor: 790_000_000,
			occurredAt: '2025-10-01T05:00:00Z'
		});
		await record({
			kind: 'expense',
			accountId: cop,
			categoryId: expense,
			amountMinor: 24_590_000,
			occurredAt: '2025-10-15T12:00:00Z'
		});
		await record({
			kind: 'expense',
			accountId: usd,
			categoryId: expense,
			amountMinor: 1_250,
			occurredAt: '2025-10-20T12:00:00Z'
		});
		await record({
			kind: 'transfer',
			fromAccountId: cop,
			toAccountId: copSavings,
			amountMinor: 100_000,
			occurredAt: '2025-10-21T12:00:00Z'
		});
		// Outside the period (the upper bound is exclusive).
		await record({
			kind: 'expense',
			accountId: cop,
			categoryId: expense,
			amountMinor: 999,
			occurredAt: '2025-11-01T05:00:00Z'
		});

		const response = await agent
			.get('/api/transactions/summary')
			.query({ from: '2025-10-01T05:00:00Z', to: '2025-11-01T05:00:00Z' })
			.expect(200);

		expect(response.body.data).toEqual({
			totals: [
				{
					currency: 'COP',
					incomeMinor: 790_000_000,
					expenseMinor: 24_590_000,
					// The income, the expense and the transfer.
					count: 3,
					incomeCount: 1,
					expenseCount: 1
				},
				{
					currency: 'USD',
					incomeMinor: 0,
					expenseMinor: 1_250,
					count: 1,
					incomeCount: 0,
					expenseCount: 1
				}
			]
		});
	});

	it('only sees the current user and rejects a missing range', async () => {
		const { agent } = await signUp(t.app);
		const response = await agent
			.get('/api/transactions/summary')
			.query({ from: '2000-01-01T00:00:00Z', to: '2100-01-01T00:00:00Z' })
			.expect(200);
		expect(response.body.data).toEqual({ totals: [] });

		await agent.get('/api/transactions/summary').expect(422);
	});
});
