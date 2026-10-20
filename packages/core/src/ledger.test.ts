import { describe, expect, it } from 'vitest';
import { assertValidEntries, buildEntries, LedgerError } from './ledger.js';

describe('buildEntries', () => {
	it('creates a single outflow for an expense', () => {
		expect(buildEntries({ kind: 'expense', accountId: 'a', amountMinor: 1250n })).toEqual([
			{ accountId: 'a', amountMinor: -1250n }
		]);
	});

	it('creates a single inflow for income', () => {
		expect(buildEntries({ kind: 'income', accountId: 'a', amountMinor: 500n })).toEqual([
			{ accountId: 'a', amountMinor: 500n }
		]);
	});

	it('keeps the sign of an adjustment', () => {
		expect(buildEntries({ kind: 'adjustment', accountId: 'a', amountMinor: -20n })).toEqual([
			{ accountId: 'a', amountMinor: -20n }
		]);
		expect(() => buildEntries({ kind: 'adjustment', accountId: 'a', amountMinor: 0n })).toThrow(
			LedgerError
		);
	});

	it('creates opposite entries for a transfer', () => {
		expect(
			buildEntries({ kind: 'transfer', fromAccountId: 'a', toAccountId: 'b', amountMinor: 100n })
		).toEqual([
			{ accountId: 'a', amountMinor: -100n },
			{ accountId: 'b', amountMinor: 100n }
		]);
	});

	it('supports cross-currency transfers', () => {
		const entries = buildEntries({
			kind: 'transfer',
			fromAccountId: 'usd',
			toAccountId: 'eur',
			amountMinor: 10000n,
			toAmountMinor: 9200n
		});
		expect(entries[1]).toEqual({ accountId: 'eur', amountMinor: 9200n });
	});

	it.each([
		{ kind: 'expense', accountId: 'a', amountMinor: 0n },
		{ kind: 'income', accountId: 'a', amountMinor: -1n },
		{ kind: 'transfer', fromAccountId: 'a', toAccountId: 'a', amountMinor: 1n },
		{ kind: 'transfer', fromAccountId: 'a', toAccountId: 'b', amountMinor: 1n, toAmountMinor: 0n }
	] as const)('rejects invalid draft %o', (draft) => {
		expect(() => buildEntries(draft)).toThrow(LedgerError);
	});
});

describe('assertValidEntries', () => {
	it('accepts entries produced by buildEntries', () => {
		expect(() =>
			assertValidEntries(
				'transfer',
				buildEntries({ kind: 'transfer', fromAccountId: 'a', toAccountId: 'b', amountMinor: 1n })
			)
		).not.toThrow();
	});

	it.each([
		['expense', []],
		['expense', [{ accountId: 'a', amountMinor: 0n }]],
		['expense', [{ accountId: 'a', amountMinor: 5n }]],
		['income', [{ accountId: 'a', amountMinor: -5n }]],
		['transfer', [{ accountId: 'a', amountMinor: -5n }]],
		[
			'transfer',
			[
				{ accountId: 'a', amountMinor: -5n },
				{ accountId: 'a', amountMinor: 5n }
			]
		],
		[
			'transfer',
			[
				{ accountId: 'a', amountMinor: 5n },
				{ accountId: 'b', amountMinor: 5n }
			]
		]
	] as const)('rejects inconsistent %s entries', (kind, entries) => {
		expect(() => assertValidEntries(kind, entries)).toThrow(LedgerError);
	});
});
