import type { Transaction } from '@savesphere/contracts';
import { describe, expect, it } from 'vitest';
import { describeTransaction } from './transactions.ts';

const accounts = [
	{ id: 'a1', name: 'Bancolombia', currency: 'COP' },
	{ id: 'a2', name: 'Nequi', currency: 'COP' }
];
const categories = [{ id: 'c1', name: 'Dining Out', icon: 'utensils' }];

const tx = (overrides: Partial<Transaction>): Transaction => ({
	id: 't1',
	kind: 'expense',
	categoryId: 'c1',
	occurredAt: '2026-10-20T15:00:00.000Z',
	description: null,
	note: null,
	source: 'app',
	entries: [{ accountId: 'a1', amountMinor: -2_850_000 }],
	createdAt: '2026-10-20T15:00:00.000Z',
	...overrides
});

describe('describeTransaction', () => {
	it('titles an expense by its description, else its (translated) category', () => {
		expect(describeTransaction(tx({}), accounts, categories)).toMatchObject({
			title: 'Dining out',
			categoryName: 'Dining out',
			accountName: 'Bancolombia',
			amountMinor: -2_850_000,
			currency: 'COP',
			tone: 'expense'
		});
		expect(describeTransaction(tx({ description: 'Café' }), accounts, categories).title).toBe(
			'Café'
		);
	});

	it('shows transfers unsigned, named after the receiving account', () => {
		const transfer = tx({
			kind: 'transfer',
			categoryId: null,
			entries: [
				{ accountId: 'a1', amountMinor: -100_000 },
				{ accountId: 'a2', amountMinor: 100_000 }
			]
		});
		expect(describeTransaction(transfer, accounts, categories)).toMatchObject({
			title: 'Transfer to Nequi',
			amountMinor: 100_000,
			tone: 'neutral',
			accountName: 'Bancolombia'
		});
	});

	it('labels opening balances', () => {
		const opening = tx({
			kind: 'adjustment',
			categoryId: null,
			description: 'Opening balance',
			entries: [{ accountId: 'a2', amountMinor: 500_000 }]
		});
		expect(describeTransaction(opening, accounts, categories)).toMatchObject({
			title: 'Opening balance',
			tone: 'income',
			accountName: 'Nequi'
		});
	});
});
