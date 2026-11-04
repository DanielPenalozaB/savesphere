import { describe, expect, it } from 'vitest';
import { toAccountInput } from './account-form.ts';

const form = (fields: Record<string, string>) => {
	const data = new FormData();
	for (const [key, value] of Object.entries(fields)) data.set(key, value);
	return data;
};

describe('toAccountInput', () => {
	it('parses the opening balance in the account currency and locale', () => {
		expect(
			toAccountInput(
				form({ name: ' Bancolombia ', kind: 'savings', currency: 'COP', opening: '1.500.000' }),
				'es-CO'
			)
		).toEqual({
			input: {
				name: 'Bancolombia',
				kind: 'savings',
				currency: 'COP',
				includeInTotals: true,
				openingBalanceMinor: 150_000_000
			}
		});
	});

	it('records card debt as a negative opening balance and treats 0 as none', () => {
		expect(
			toAccountInput(
				form({ name: 'Visa', kind: 'credit_card', currency: 'USD', opening: '200' }),
				'en'
			)
		).toMatchObject({ input: { openingBalanceMinor: -20_000 } });
		expect(
			toAccountInput(form({ name: 'Wallet', kind: 'cash', currency: 'USD', opening: '0' }), 'en')
		).toMatchObject({ input: { openingBalanceMinor: undefined } });
	});

	it('requires a name and a valid amount, and falls back on unknown kinds/currencies', () => {
		expect(toAccountInput(form({ name: '' }), 'en')).toEqual({ error: 'name' });
		expect(toAccountInput(form({ name: 'A', opening: 'abc' }), 'en')).toEqual({ error: 'amount' });
		expect(toAccountInput(form({ name: 'A', kind: 'boat', currency: 'XXX' }), 'en')).toMatchObject({
			input: { kind: 'other', currency: 'USD' }
		});
	});
});
