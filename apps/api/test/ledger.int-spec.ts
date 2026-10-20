import { randomUUID } from 'node:crypto';
import { transactionEntries } from '@savesphere/db';
import { createTestApp, signUp, type Agent, type TestApp } from './helpers/app.js';

const now = () => new Date().toISOString();

async function createAccount(agent: Agent, body: Record<string, unknown>) {
	const response = await agent.post('/api/accounts').send(body).expect(201);
	return response.body.data as { id: string; balanceMinor: number; currency: string };
}

async function categoryId(agent: Agent, kind: 'expense' | 'income') {
	const response = await agent.get('/api/categories').expect(200);
	return (response.body.data as { id: string; kind: string }[]).find((c) => c.kind === kind)!.id;
}

async function balance(agent: Agent, accountId: string) {
	const response = await agent.get(`/api/accounts/${accountId}`).expect(200);
	return response.body.data.balanceMinor as number;
}

describe('accounts & ledger', () => {
	let t: TestApp;
	beforeAll(async () => {
		t = await createTestApp();
	});
	afterAll(() => t.close());

	it('derives balances from entries, including the opening balance', async () => {
		const { agent } = await signUp(t.app);
		const wallet = await createAccount(agent, {
			name: 'Wallet',
			kind: 'cash',
			currency: 'USD',
			openingBalanceMinor: 100_000
		});
		expect(wallet.balanceMinor).toBe(100_000);

		await agent
			.post('/api/transactions')
			.send({
				kind: 'expense',
				accountId: wallet.id,
				categoryId: await categoryId(agent, 'expense'),
				amountMinor: 1_250,
				occurredAt: now(),
				description: 'Lunch'
			})
			.expect(201);
		await agent
			.post('/api/transactions')
			.send({
				kind: 'income',
				accountId: wallet.id,
				categoryId: await categoryId(agent, 'income'),
				amountMinor: 50_000,
				occurredAt: now()
			})
			.expect(201);

		expect(await balance(agent, wallet.id)).toBe(148_750);
	});

	it('moves money between accounts with a two-entry transfer', async () => {
		const { agent } = await signUp(t.app);
		const checking = await createAccount(agent, {
			name: 'Checking',
			kind: 'checking',
			currency: 'USD',
			openingBalanceMinor: 10_000
		});
		const savings = await createAccount(agent, {
			name: 'Savings',
			kind: 'savings',
			currency: 'USD'
		});

		const transfer = await agent
			.post('/api/transactions')
			.send({
				kind: 'transfer',
				fromAccountId: checking.id,
				toAccountId: savings.id,
				amountMinor: 4_000,
				occurredAt: now()
			})
			.expect(201);
		expect(transfer.body.data.entries).toEqual([
			{ accountId: checking.id, amountMinor: -4_000 },
			{ accountId: savings.id, amountMinor: 4_000 }
		]);
		expect(await balance(agent, checking.id)).toBe(6_000);
		expect(await balance(agent, savings.id)).toBe(4_000);
	});

	it('requires the destination amount for cross-currency transfers', async () => {
		const { agent } = await signUp(t.app);
		const usd = await createAccount(agent, { name: 'USD', kind: 'checking', currency: 'USD' });
		const eur = await createAccount(agent, { name: 'EUR', kind: 'checking', currency: 'EUR' });
		const base = {
			kind: 'transfer',
			fromAccountId: usd.id,
			toAccountId: eur.id,
			amountMinor: 10_000,
			occurredAt: now()
		};

		const rejected = await agent.post('/api/transactions').send(base).expect(422);
		expect(rejected.body.error.code).toBe('VALIDATION_FAILED');

		await agent
			.post('/api/transactions')
			.send({ ...base, toAmountMinor: 9_200 })
			.expect(201);
		expect(await balance(agent, eur.id)).toBe(9_200);
	});

	it('rejects a category of the wrong kind', async () => {
		const { agent } = await signUp(t.app);
		const wallet = await createAccount(agent, { name: 'Wallet', kind: 'cash', currency: 'USD' });
		const response = await agent
			.post('/api/transactions')
			.send({
				kind: 'expense',
				accountId: wallet.id,
				categoryId: await categoryId(agent, 'income'),
				amountMinor: 100,
				occurredAt: now()
			})
			.expect(422);
		expect(response.body.error.message).toMatch(/not an expense category/);
	});

	it('is idempotent on clientRef so offline retries never duplicate', async () => {
		const { agent } = await signUp(t.app);
		const wallet = await createAccount(agent, { name: 'Wallet', kind: 'cash', currency: 'USD' });
		const body = {
			kind: 'expense',
			accountId: wallet.id,
			categoryId: await categoryId(agent, 'expense'),
			amountMinor: 999,
			occurredAt: now(),
			clientRef: randomUUID()
		};
		const [first, second] = await Promise.all([
			agent.post('/api/transactions').send(body),
			agent.post('/api/transactions').send(body)
		]);
		expect(first.status).toBe(201);
		expect(second.status).toBe(201);
		expect(second.body.data.id).toBe(first.body.data.id);
		expect(await balance(agent, wallet.id)).toBe(-999);
	});

	it('paginates newest first with a stable cursor', async () => {
		const { agent } = await signUp(t.app);
		const wallet = await createAccount(agent, { name: 'Wallet', kind: 'cash', currency: 'USD' });
		const category = await categoryId(agent, 'expense');
		for (let day = 1; day <= 5; day++) {
			await agent
				.post('/api/transactions')
				.send({
					kind: 'expense',
					accountId: wallet.id,
					categoryId: category,
					amountMinor: day,
					occurredAt: `2026-01-0${day}T12:00:00.000Z`
				})
				.expect(201);
		}

		const first = await agent.get('/api/transactions?limit=2').expect(200);
		expect(
			first.body.data.items.map(
				(tx: { entries: { amountMinor: number }[] }) => tx.entries[0]!.amountMinor
			)
		).toEqual([-5, -4]);
		const second = await agent
			.get(`/api/transactions?limit=2&cursor=${first.body.data.nextCursor}`)
			.expect(200);
		expect(
			second.body.data.items.map(
				(tx: { entries: { amountMinor: number }[] }) => tx.entries[0]!.amountMinor
			)
		).toEqual([-3, -2]);
		const last = await agent
			.get(`/api/transactions?limit=2&cursor=${second.body.data.nextCursor}`)
			.expect(200);
		expect(last.body.data.items).toHaveLength(1);
		expect(last.body.data.nextCursor).toBeNull();

		const filtered = await agent
			.get(`/api/transactions?accountId=${wallet.id}&from=2026-01-04T00:00:00.000Z`)
			.expect(200);
		expect(filtered.body.data.items).toHaveLength(2);
	});

	it('soft-deletes transactions and excludes them from balances', async () => {
		const { agent } = await signUp(t.app);
		const wallet = await createAccount(agent, {
			name: 'Wallet',
			kind: 'cash',
			currency: 'USD',
			openingBalanceMinor: 1_000
		});
		const created = await agent
			.post('/api/transactions')
			.send({
				kind: 'expense',
				accountId: wallet.id,
				categoryId: await categoryId(agent, 'expense'),
				amountMinor: 300,
				occurredAt: now()
			})
			.expect(201);
		expect(await balance(agent, wallet.id)).toBe(700);

		await agent.delete(`/api/transactions/${created.body.data.id}`).expect(200);
		expect(await balance(agent, wallet.id)).toBe(1_000);
		await agent.get(`/api/transactions/${created.body.data.id}`).expect(404);
	});

	it('rejects duplicate account names and unsupported currencies', async () => {
		const { agent } = await signUp(t.app);
		await createAccount(agent, { name: 'Wallet', kind: 'cash', currency: 'USD' });
		const duplicate = await agent
			.post('/api/accounts')
			.send({ name: 'Wallet', kind: 'cash', currency: 'USD' })
			.expect(409);
		expect(duplicate.body.error.code).toBe('CONFLICT');
		await agent
			.post('/api/accounts')
			.send({ name: 'Other', kind: 'cash', currency: 'XYZ' })
			.expect(422);
	});

	it('archives accounts and blocks new movements on them', async () => {
		const { agent } = await signUp(t.app);
		const wallet = await createAccount(agent, { name: 'Wallet', kind: 'cash', currency: 'USD' });
		const archived = await agent
			.patch(`/api/accounts/${wallet.id}`)
			.send({ archived: true })
			.expect(200);
		expect(archived.body.data.archivedAt).not.toBeNull();
		await agent
			.post('/api/transactions')
			.send({ kind: 'adjustment', accountId: wallet.id, amountMinor: 5, occurredAt: now() })
			.expect(422);
	});

	describe('tenant isolation', () => {
		it('never exposes or accepts another user’s data through the API', async () => {
			const alice = await signUp(t.app);
			const bob = await signUp(t.app);
			const aliceWallet = await createAccount(alice.agent, {
				name: 'Wallet',
				kind: 'cash',
				currency: 'USD'
			});

			await bob.agent.get(`/api/accounts/${aliceWallet.id}`).expect(404);
			const bobAccounts = await bob.agent.get('/api/accounts').expect(200);
			expect(bobAccounts.body.data).toEqual([]);
			await bob.agent
				.post('/api/transactions')
				.send({
					kind: 'expense',
					accountId: aliceWallet.id,
					categoryId: await categoryId(bob.agent, 'expense'),
					amountMinor: 1,
					occurredAt: now()
				})
				.expect(404);
		});

		it('is enforced by composite foreign keys even if application code is bypassed', async () => {
			const alice = await signUp(t.app);
			const bob = await signUp(t.app);
			const aliceWallet = await createAccount(alice.agent, {
				name: 'Wallet',
				kind: 'cash',
				currency: 'USD'
			});
			const bobTx = await bob.agent
				.post('/api/transactions')
				.send({
					kind: 'adjustment',
					accountId: (await createAccount(bob.agent, { name: 'B', kind: 'cash', currency: 'USD' }))
						.id,
					amountMinor: 1,
					occurredAt: now()
				})
				.expect(201);

			await expect(
				t.db.db.insert(transactionEntries).values({
					userId: bob.userId,
					transactionId: bobTx.body.data.id,
					accountId: aliceWallet.id,
					amountMinor: 1n
				})
			).rejects.toMatchObject({ cause: { code: '23503' } });
		});
	});
});
