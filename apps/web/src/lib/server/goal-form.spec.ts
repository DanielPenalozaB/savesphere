import { describe, expect, it } from 'vitest';
import { toAllocationInput, toGoalInput } from './goal-form.ts';

const form = (fields: Record<string, string>) => {
	const data = new FormData();
	for (const [key, value] of Object.entries(fields)) data.set(key, value);
	return data;
};

describe('toGoalInput', () => {
	it('parses the target in the goal currency and keeps a future date', () => {
		expect(
			toGoalInput(
				form({
					name: 'Fondo de emergencia',
					currency: 'COP',
					target: '30.000.000',
					targetDate: '2027-06-30'
				}),
				'es-CO',
				'2026-10-23'
			)
		).toEqual({
			input: {
				name: 'Fondo de emergencia',
				currency: 'COP',
				targetMinor: 3_000_000_000,
				targetDate: '2027-06-30'
			}
		});
	});

	it('rejects a missing name, a bad amount and a past date', () => {
		expect(toGoalInput(form({ target: '10' }), 'en', '2026-10-23')).toEqual({ error: 'name' });
		expect(toGoalInput(form({ name: 'Trip', target: '0' }), 'en', '2026-10-23')).toEqual({
			error: 'amount'
		});
		expect(
			toGoalInput(
				form({ name: 'Trip', target: '10', targetDate: '2026-01-01' }),
				'en',
				'2026-10-23'
			)
		).toEqual({ error: 'date' });
	});
});

describe('toAllocationInput', () => {
	it('reads a deposit or a withdrawal in the goal currency', () => {
		expect(toAllocationInput(form({ amount: '250.000', note: ' Prima ' }), 'COP', 'es-CO')).toEqual(
			{ input: { amountMinor: 25_000_000, note: 'Prima' } }
		);
		expect(
			toAllocationInput(form({ amount: '12.50', direction: 'withdraw' }), 'USD', 'en-US')
		).toEqual({ input: { amountMinor: -1_250 } });
	});

	it('rejects a missing or invalid amount', () => {
		expect(toAllocationInput(form({ amount: '' }), 'COP', 'es-CO')).toEqual({ error: 'amount' });
		expect(toAllocationInput(form({ amount: '-5' }), 'COP', 'es-CO')).toEqual({ error: 'amount' });
	});
});
