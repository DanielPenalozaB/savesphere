import { goalAllocations } from '@savesphere/db';
import { createTestApp, signUp, type TestApp } from './helpers/app.js';

describe('goals', () => {
	let t: TestApp;
	beforeAll(async () => {
		t = await createTestApp();
	});
	afterAll(() => t.close());

	it('creates goals and derives progress from allocations', async () => {
		const { agent, userId } = await signUp(t.app);
		const created = await agent
			.post('/api/goals')
			.send({
				name: 'Fondo de emergencia',
				targetMinor: 3_000_000_000,
				currency: 'COP',
				targetDate: '2027-06-30'
			})
			.expect(201);
		expect(created.body.data).toMatchObject({
			savedMinor: 0,
			status: 'active',
			targetDate: '2027-06-30'
		});
		await agent
			.post('/api/goals')
			.send({ name: 'Viajes', targetMinor: 500_000, currency: 'USD' })
			.expect(201);

		const goalId = created.body.data.id as string;
		await t.db.db.insert(goalAllocations).values([
			{ userId, goalId, amountMinor: 2_600_000_000n, allocatedOn: '2026-10-01' },
			{ userId, goalId, amountMinor: -50_000_000n, allocatedOn: '2026-10-15' }
		]);

		const list = await agent.get('/api/goals').expect(200);
		expect(
			list.body.data.map((g: { name: string; savedMinor: number }) => [g.name, g.savedMinor])
		).toEqual([
			['Fondo de emergencia', 2_550_000_000],
			['Viajes', 0]
		]);
	});

	it('validates input and keeps goals private', async () => {
		const { agent } = await signUp(t.app);
		await agent.post('/api/goals').send({ name: '', targetMinor: 0, currency: 'COP' }).expect(422);
		await agent
			.post('/api/goals')
			.send({ name: 'X', targetMinor: 100, currency: 'ZZZ' })
			.expect(422);
		expect((await agent.get('/api/goals').expect(200)).body.data).toEqual([]);
	});
});
