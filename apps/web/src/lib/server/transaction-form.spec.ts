import { describe, expect, it } from 'vitest';
import { toTransactionInput, type TransactionFormValues } from './transaction-form.ts';

const ctx = {
	accounts: [
		{ id: 'cop-1', currency: 'COP' },
		{ id: 'cop-2', currency: 'COP' },
		{ id: 'usd-1', currency: 'USD' }
	],
	categories: [
		{ id: 'food', kind: 'expense' as const },
		{ id: 'salary', kind: 'income' as const }
	],
	locale: 'es-CO',
	timeZone: 'America/Bogota',
	// 22:00 in Bogotá on Oct 23, already Oct 24 in UTC.
	now: new Date('2026-10-24T03:00:00Z')
};

const values = (overrides: Partial<TransactionFormValues>): TransactionFormValues => ({
	kind: 'expense',
	amount: '28.500',
	amountReceived: '',
	accountId: 'cop-1',
	toAccountId: '',
	categoryId: 'food',
	date: '2026-10-23',
	description: 'Café',
	clientRef: '',
	...overrides
});

describe('toTransactionInput', () => {
	it('builds an expense in minor units, keeping "now" for today in the user time zone', () => {
		expect(toTransactionInput(values({}), ctx)).toEqual({
			input: {
				kind: 'expense',
				accountId: 'cop-1',
				categoryId: 'food',
				amountMinor: 2_850_000,
				occurredAt: '2026-10-24T03:00:00.000Z',
				description: 'Café',
				clientRef: undefined
			}
		});
	});

	it('places past days at local noon', () => {
		const result = toTransactionInput(values({ date: '2026-10-01' }), ctx);
		expect('input' in result && result.input.occurredAt).toBe('2026-10-01T17:00:00.000Z');
	});

	it('requires a category of the matching kind', () => {
		expect(toTransactionInput(values({ kind: 'income', categoryId: 'food' }), ctx)).toEqual({
			error: 'category'
		});
		expect(toTransactionInput(values({ kind: 'income', categoryId: 'salary' }), ctx)).toMatchObject(
			{ input: { kind: 'income', categoryId: 'salary' } }
		);
	});

	it('rejects bad amounts and unknown accounts', () => {
		expect(toTransactionInput(values({ amount: '0' }), ctx)).toEqual({ error: 'amount' });
		expect(toTransactionInput(values({ accountId: 'nope' }), ctx)).toEqual({ error: 'account' });
	});

	it('builds transfers, asking for the received amount across currencies', () => {
		expect(
			toTransactionInput(values({ kind: 'transfer', toAccountId: 'cop-2' }), ctx)
		).toMatchObject({
			input: {
				kind: 'transfer',
				fromAccountId: 'cop-1',
				toAccountId: 'cop-2',
				amountMinor: 2_850_000
			}
		});
		expect(toTransactionInput(values({ kind: 'transfer', toAccountId: 'cop-1' }), ctx)).toEqual({
			error: 'same_account'
		});
		expect(toTransactionInput(values({ kind: 'transfer', toAccountId: 'usd-1' }), ctx)).toEqual({
			error: 'amount_received'
		});
		expect(
			toTransactionInput(
				values({ kind: 'transfer', toAccountId: 'usd-1', amountReceived: '7,10' }),
				ctx
			)
		).toMatchObject({ input: { toAmountMinor: 710 } });
	});

	it('keeps a well-formed idempotency key', () => {
		const clientRef = '0192f0c4-7d3e-7a2b-9c1d-4e5f6a7b8c9d';
		expect(toTransactionInput(values({ clientRef }), ctx)).toMatchObject({ input: { clientRef } });
	});
});
