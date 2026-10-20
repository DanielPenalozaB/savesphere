import { expect, test } from './fixtures';

test('capabilities reflect whether AI is connected', async ({ user, aiEnabled }) => {
	const response = await user.api.get('/api/me/capabilities');
	const { data } = await response.json();
	expect(data.ai.available).toBe(aiEnabled);
});

test('AI-only features are enforced by the API', async ({ user, aiEnabled }) => {
	const response = await user.api.post('/api/ai/parse-transaction', {
		data: { text: 'lunch 12.50' }
	});
	if (aiEnabled) {
		expect(response.status()).toBe(200);
		expect((await response.json()).data).toMatchObject({ kind: 'expense', amountMinor: 1250 });
	} else {
		expect(response.status()).toBe(403);
		expect((await response.json()).error.code).toBe('AI_NOT_CONFIGURED');
	}
});

test('core money tracking works in both modes', async ({ user }) => {
	const account = await user.api.post('/api/accounts', {
		data: { name: 'Wallet', kind: 'cash', currency: 'USD', openingBalanceMinor: 10_000 }
	});
	expect(account.status()).toBe(201);
	const { data: wallet } = await account.json();

	const { data: categories } = await (await user.api.get('/api/categories')).json();
	const food = categories.find((c: { name: string }) => c.name === 'Dining Out');
	const expense = await user.api.post('/api/transactions', {
		data: {
			kind: 'expense',
			accountId: wallet.id,
			categoryId: food.id,
			amountMinor: 1_250,
			occurredAt: new Date().toISOString()
		}
	});
	expect(expense.status()).toBe(201);

	const { data: updated } = await (await user.api.get(`/api/accounts/${wallet.id}`)).json();
	expect(updated.balanceMinor).toBe(8_750);
});
