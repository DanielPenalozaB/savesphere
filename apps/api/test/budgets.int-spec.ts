import { createTestApp, signUp, type Agent, type TestApp } from './helpers/app.js';

type CategoryRow = { id: string; kind: string; name: string };

async function createAccount(agent: Agent, name: string, currency: string) {
	const response = await agent
		.post('/api/accounts')
		.send({ name, kind: 'checking', currency, openingBalanceMinor: 0 })
		.expect(201);
	return response.body.data.id as string;
}

async function categoriesByName(agent: Agent) {
	const response = await agent.get('/api/categories').expect(200);
	const rows = response.body.data as CategoryRow[];
	return (name: string) => rows.find((c) => c.name === name)!;
}

// A period away from "now", so account opening balances never fall inside it.
const OCTOBER = { from: '2025-10-01T05:00:00.000Z', to: '2025-11-01T05:00:00.000Z' };

describe('budgets', () => {
	let t: TestApp;
	beforeAll(async () => {
		t = await createTestApp();
	});
	afterAll(() => t.close());

	it('creates a budget with bucketed envelopes and lists it', async () => {
		const { agent } = await signUp(t.app);
		const category = await categoriesByName(agent);
		const created = await agent
			.post('/api/budgets')
			.send({
				name: 'Mensual',
				currency: 'COP',
				startsOn: '2025-10-01',
				limits: [
					{ categoryId: category('Housing').id, limitMinor: 220_000_000, bucket: 'needs' },
					{
						categoryId: category('Dining Out').id,
						limitMinor: 60_000_000,
						bucket: 'wants',
						alertThresholdPct: 90
					}
				]
			})
			.expect(201);
		expect(created.body.data).toMatchObject({
			name: 'Mensual',
			period: 'monthly',
			currency: 'COP',
			startsOn: '2025-10-01',
			endsOn: null
		});
		expect(created.body.data.limits).toHaveLength(2);
		expect(created.body.data.limits).toContainEqual({
			categoryId: category('Housing').id,
			limitMinor: 220_000_000,
			bucket: 'needs',
			alertThresholdPct: 80
		});

		const list = await agent.get('/api/budgets').expect(200);
		expect(list.body.data).toHaveLength(1);
		expect(list.body.data[0].limits).toHaveLength(2);
	});

	it('sums expenses per envelope in the period, in the budget currency, including subcategories', async () => {
		const { agent } = await signUp(t.app);
		const category = await categoriesByName(agent);
		const cop = await createAccount(agent, 'Bancolombia', 'COP');
		const usd = await createAccount(agent, 'Travel card', 'USD');
		const dining = category('Dining Out').id;
		const groceries = category('Food & Groceries').id;
		const coffee = (
			await agent
				.post('/api/categories')
				.send({ name: 'Coffee', kind: 'expense', parentId: dining })
				.expect(201)
		).body.data.id as string;

		const budget = (
			await agent
				.post('/api/budgets')
				.send({
					name: 'Mensual',
					currency: 'COP',
					limits: [
						{ categoryId: dining, limitMinor: 60_000_000, bucket: 'wants' },
						{ categoryId: groceries, limitMinor: 80_000_000, bucket: 'needs' }
					]
				})
				.expect(201)
		).body.data.id as string;

		const expense = (accountId: string, categoryId: string, amountMinor: number, at: string) =>
			agent
				.post('/api/transactions')
				.send({ kind: 'expense', accountId, categoryId, amountMinor, occurredAt: at })
				.expect(201);
		await expense(cop, dining, 30_000_000, '2025-10-05T12:00:00Z');
		await expense(cop, coffee, 4_000_000, '2025-10-06T12:00:00Z');
		// Outside the period, in another currency, or deleted: not counted.
		await expense(cop, dining, 9_000_000, '2025-09-30T12:00:00Z');
		await expense(usd, dining, 2_500, '2025-10-07T12:00:00Z');
		const deleted = await expense(cop, dining, 1_000_000, '2025-10-08T12:00:00Z');
		await agent.delete(`/api/transactions/${deleted.body.data.id}`).expect(200);
		// Income in a budgeted category never counts as spending.
		await agent
			.post('/api/transactions')
			.send({
				kind: 'income',
				accountId: cop,
				categoryId: category('Salary').id,
				amountMinor: 500_000_000,
				occurredAt: '2025-10-01T12:00:00Z'
			})
			.expect(201);

		const spending = await agent
			.get(`/api/budgets/${budget}/spending?${new URLSearchParams(OCTOBER)}`)
			.expect(200);
		expect(spending.body.data.currency).toBe('COP');
		expect(spending.body.data.envelopes).toHaveLength(2);
		expect(spending.body.data.envelopes).toContainEqual({
			categoryId: dining,
			spentMinor: 34_000_000
		});
		expect(spending.body.data.envelopes).toContainEqual({ categoryId: groceries, spentMinor: 0 });
	});

	it('replaces name and envelopes on update, and deletes', async () => {
		const { agent } = await signUp(t.app);
		const category = await categoriesByName(agent);
		const id = (
			await agent
				.post('/api/budgets')
				.send({
					name: 'Mensual',
					currency: 'COP',
					limits: [{ categoryId: category('Housing').id, limitMinor: 100, bucket: 'needs' }]
				})
				.expect(201)
		).body.data.id as string;

		const updated = await agent
			.put(`/api/budgets/${id}`)
			.send({
				name: 'Hogar',
				limits: [{ categoryId: category('Transport').id, limitMinor: 500, bucket: 'needs' }]
			})
			.expect(200);
		expect(updated.body.data.name).toBe('Hogar');
		expect(updated.body.data.limits).toEqual([
			{
				categoryId: category('Transport').id,
				limitMinor: 500,
				bucket: 'needs',
				alertThresholdPct: 80
			}
		]);

		await agent.delete(`/api/budgets/${id}`).expect(200);
		expect((await agent.get('/api/budgets').expect(200)).body.data).toEqual([]);
		await agent.delete(`/api/budgets/${id}`).expect(404);
	});

	it('validates envelopes and keeps budgets private', async () => {
		const owner = await signUp(t.app);
		const category = await categoriesByName(owner.agent);
		const send = (body: Record<string, unknown>) => owner.agent.post('/api/budgets').send(body);
		const housing = category('Housing').id;

		// No envelopes, duplicate categories, non-positive limits, unknown buckets.
		await send({ name: 'X', currency: 'COP', limits: [] }).expect(422);
		await send({
			name: 'X',
			currency: 'COP',
			limits: [
				{ categoryId: housing, limitMinor: 1, bucket: 'needs' },
				{ categoryId: housing, limitMinor: 2, bucket: 'wants' }
			]
		}).expect(422);
		await send({
			name: 'X',
			currency: 'COP',
			limits: [{ categoryId: housing, limitMinor: 0, bucket: 'needs' }]
		}).expect(422);
		await send({
			name: 'X',
			currency: 'COP',
			limits: [{ categoryId: housing, limitMinor: 1, bucket: 'luxury' }]
		}).expect(422);
		// Income categories and unsupported currencies.
		await send({
			name: 'X',
			currency: 'COP',
			limits: [{ categoryId: category('Salary').id, limitMinor: 1, bucket: 'needs' }]
		}).expect(422);
		await send({
			name: 'X',
			currency: 'ZZZ',
			limits: [{ categoryId: housing, limitMinor: 1, bucket: 'needs' }]
		}).expect(422);

		const id = (
			await send({
				name: 'Mío',
				currency: 'COP',
				limits: [{ categoryId: housing, limitMinor: 1, bucket: 'needs' }]
			}).expect(201)
		).body.data.id as string;

		// Another user can't see, read, change or delete it, nor use the owner's categories.
		const other = await signUp(t.app);
		expect((await other.agent.get('/api/budgets').expect(200)).body.data).toEqual([]);
		await other.agent
			.get(`/api/budgets/${id}/spending?${new URLSearchParams(OCTOBER)}`)
			.expect(404);
		await other.agent
			.put(`/api/budgets/${id}`)
			.send({
				name: 'Hijacked',
				limits: [
					{
						categoryId: (await categoriesByName(other.agent))('Housing').id,
						limitMinor: 1,
						bucket: 'needs'
					}
				]
			})
			.expect(404);
		await other.agent.delete(`/api/budgets/${id}`).expect(404);
		await other.agent
			.post('/api/budgets')
			.send({
				name: 'X',
				currency: 'COP',
				limits: [{ categoryId: housing, limitMinor: 1, bucket: 'needs' }]
			})
			.expect(422);
	});
});
