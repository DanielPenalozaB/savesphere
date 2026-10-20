import { FakeAiClient } from './fake-ai.client.js';

describe('FakeAiClient', () => {
	it('validates keys deterministically', async () => {
		expect(await new FakeAiClient('sk-good').validate()).toBe(true);
		expect(await new FakeAiClient('invalid-key').validate()).toBe(false);
	});

	it('extracts amount, kind and a matching category', async () => {
		const client = new FakeAiClient('sk');
		const { suggestion } = await client.suggestTransaction('got salary 2000', [
			'Salary',
			'Dining Out'
		]);
		expect(suggestion).toEqual({
			kind: 'income',
			amount: '2000',
			description: 'got salary',
			categoryName: 'Salary'
		});
	});
});
