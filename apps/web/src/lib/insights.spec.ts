import type { Transaction } from '@savesphere/contracts';
import { describe, expect, it } from 'vitest';
import {
	groupByDay,
	percentChange,
	topExpenseCategory,
	weekOfMonth,
	weekdayRhythm
} from './insights.ts';

const expense = (occurredAt: string, amountMinor: number) =>
	({
		kind: 'expense',
		occurredAt,
		entries: [{ accountId: 'a', amountMinor: -amountMinor }]
	}) as Pick<Transaction, 'kind' | 'occurredAt' | 'entries'>;

describe('percentChange', () => {
	it('rounds to one decimal and skips an empty baseline', () => {
		expect(percentChange(1084, 1000)).toBe(8.4);
		expect(percentChange(958, 1000)).toBe(-4.2);
		expect(percentChange(5, 0)).toBeNull();
	});
});

describe('weekdayRhythm', () => {
	it('buckets expenses by local weekday, starting on Monday, scaled to 3 dots', () => {
		const rhythm = weekdayRhythm(
			[
				// Thursday 22:00 in Bogotá (Friday in UTC).
				expense('2026-10-23T03:00:00Z', 9_000),
				expense('2026-10-19T15:00:00Z', 3_000), // Monday
				expense('2026-10-20T15:00:00Z', 1_000), // Tuesday
				{ ...expense('2026-10-20T15:00:00Z', 50_000), kind: 'income' }
			],
			{ timeZone: 'America/Bogota', locale: 'es', weekStartsOn: 1 }
		);
		expect(rhythm.map((d) => d.label).join('')).toBe('LMXJVSD');
		expect(rhythm.map((d) => d.level)).toEqual([1, 1, 0, 3, 0, 0, 0]);
		expect(rhythm[3]!.expenseMinor).toBe(9_000);
	});
});

describe('weekOfMonth', () => {
	it('counts weeks from the user week start', () => {
		// October 2026 starts on a Thursday.
		expect(weekOfMonth('2026-10-01', 1)).toEqual({ week: 1, weeks: 5 });
		expect(weekOfMonth('2026-10-23', 1)).toEqual({ week: 4, weeks: 5 });
		expect(weekOfMonth('2026-10-23', 0)).toEqual({ week: 4, weeks: 5 });
	});
});

describe('groupByDay', () => {
	it('groups consecutive items by local day', () => {
		const groups = groupByDay(
			[
				{ id: 1, occurredAt: '2026-10-24T03:00:00Z' },
				{ id: 2, occurredAt: '2026-10-23T15:00:00Z' },
				{ id: 3, occurredAt: '2026-10-22T15:00:00Z' }
			],
			'America/Bogota'
		);
		expect(groups.map((g) => [g.date, g.items.map((i) => i.id)])).toEqual([
			['2026-10-23', [1, 2]],
			['2026-10-22', [3]]
		]);
	});
});

describe('topExpenseCategory', () => {
	it('picks the category with the most spending', () => {
		const tx = (categoryId: string | null, amount: number) => ({
			categoryId,
			entries: [{ accountId: 'a', amountMinor: -amount }]
		});
		expect(
			topExpenseCategory([tx('food', 10), tx('home', 25), tx('food', 20), tx(null, 99)])
		).toEqual({ categoryId: 'food', amountMinor: 30 });
		expect(topExpenseCategory([])).toBeNull();
	});
});
