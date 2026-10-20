import { createTestApp, signUp, type TestApp } from './helpers/app.js';

describe('categories', () => {
	let t: TestApp;
	beforeAll(async () => {
		t = await createTestApp();
	});
	afterAll(() => t.close());

	it('creates top-level and nested categories', async () => {
		const { agent } = await signUp(t.app);
		const parent = await agent
			.post('/api/categories')
			.send({ name: 'Pets', kind: 'expense', icon: 'paw-print' })
			.expect(201);
		const child = await agent
			.post('/api/categories')
			.send({ name: 'Vet', kind: 'expense', parentId: parent.body.data.id, color: '#22aa88' })
			.expect(201);
		expect(child.body.data).toMatchObject({
			name: 'Vet',
			parentId: parent.body.data.id,
			color: '#22aa88'
		});

		const list = await agent.get('/api/categories').expect(200);
		expect(list.body.data.map((c: { name: string }) => c.name)).toEqual(
			expect.arrayContaining(['Pets', 'Vet'])
		);
	});

	it('rejects duplicates, kind mismatches and unknown parents', async () => {
		const { agent } = await signUp(t.app);
		await agent.post('/api/categories').send({ name: 'Dining Out', kind: 'expense' }).expect(409);

		const income = await agent
			.post('/api/categories')
			.send({ name: 'Bonus', kind: 'income' })
			.expect(201);
		await agent
			.post('/api/categories')
			.send({ name: 'Bad', kind: 'expense', parentId: income.body.data.id })
			.expect(422);
		await agent
			.post('/api/categories')
			.send({ name: 'Orphan', kind: 'expense', parentId: '01a157d5-d434-719c-88bd-1cea368fca52' })
			.expect(404);
	});

	it('validates the request body against the shared contract', async () => {
		const { agent } = await signUp(t.app);
		const response = await agent
			.post('/api/categories')
			.send({ name: '', kind: 'other' })
			.expect(422);
		expect(response.body.error.code).toBe('VALIDATION_FAILED');
		expect(response.body.error.details.map((d: { path: string }) => d.path)).toEqual([
			'name',
			'kind'
		]);
	});
});
