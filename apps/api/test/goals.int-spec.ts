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

describe('goal updates and allocations', () => {
	let t: TestApp;
	beforeAll(async () => {
		t = await createTestApp();
	});
	afterAll(() => t.close());

	async function newGoal(agent: Awaited<ReturnType<typeof signUp>>['agent']) {
		const response = await agent
			.post('/api/goals')
			.send({ name: 'Viaje a Kioto', targetMinor: 700_000_000, currency: 'COP' })
			.expect(201);
		return response.body.data.id as string;
	}

	it('edits a goal, clears its date and stamps achievedAt on completion', async () => {
		const { agent } = await signUp(t.app);
		const id = await newGoal(agent);

		const edited = await agent
			.patch(`/api/goals/${id}`)
			.send({ name: 'Kioto 2027', targetMinor: 800_000_000, targetDate: '2027-07-31' })
			.expect(200);
		expect(edited.body.data).toMatchObject({
			name: 'Kioto 2027',
			targetMinor: 800_000_000,
			targetDate: '2027-07-31',
			status: 'active',
			achievedAt: null
		});

		await agent.patch(`/api/goals/${id}`).send({ targetDate: null }).expect(200);
		const achieved = await agent.patch(`/api/goals/${id}`).send({ status: 'achieved' }).expect(200);
		expect(achieved.body.data.targetDate).toBeNull();
		expect(achieved.body.data.achievedAt).toEqual(expect.any(String));

		const reopened = await agent.patch(`/api/goals/${id}`).send({ status: 'active' }).expect(200);
		expect(reopened.body.data.achievedAt).toBeNull();

		await agent.patch(`/api/goals/${id}`).send({}).expect(422);
		await agent.patch(`/api/goals/${id}`).send({ status: 'done' }).expect(422);
	});

	it('adds and withdraws money, never below zero', async () => {
		const { agent } = await signUp(t.app);
		const id = await newGoal(agent);

		const deposit = await agent
			.post(`/api/goals/${id}/allocations`)
			.send({ amountMinor: 50_000_000, note: 'Prima' })
			.expect(201);
		expect(deposit.body.data.savedMinor).toBe(50_000_000);

		const withdrawal = await agent
			.post(`/api/goals/${id}/allocations`)
			.send({ amountMinor: -20_000_000, allocatedOn: '2026-11-04' })
			.expect(201);
		expect(withdrawal.body.data.savedMinor).toBe(30_000_000);

		await agent.post(`/api/goals/${id}/allocations`).send({ amountMinor: -30_000_001 }).expect(422);
		await agent.post(`/api/goals/${id}/allocations`).send({ amountMinor: 0 }).expect(422);
		expect((await agent.get(`/api/goals/${id}`).expect(200)).body.data.savedMinor).toBe(30_000_000);

		await agent.patch(`/api/goals/${id}`).send({ status: 'abandoned' }).expect(200);
		await agent.post(`/api/goals/${id}/allocations`).send({ amountMinor: 1_000 }).expect(409);
	});

	it("keeps other users' goals out of reach", async () => {
		const owner = await signUp(t.app);
		const id = await newGoal(owner.agent);
		const other = await signUp(t.app);
		await other.agent.get(`/api/goals/${id}`).expect(404);
		await other.agent.patch(`/api/goals/${id}`).send({ name: 'Mine' }).expect(404);
		await other.agent.post(`/api/goals/${id}/allocations`).send({ amountMinor: 1_000 }).expect(404);
		expect((await owner.agent.get(`/api/goals/${id}`).expect(200)).body.data.name).toBe(
			'Viaje a Kioto'
		);
	});
});
