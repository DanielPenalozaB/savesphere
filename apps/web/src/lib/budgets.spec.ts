import type { Budget } from '@savesphere/contracts';
import { describe, expect, it } from 'vitest';
import { envelopeViews, limitsFromForm, monthProgress, suggestedBucket } from './budgets.ts';

const budget: Budget = {
	id: '00000000-0000-7000-8000-000000000001',
	name: 'Mensual',
	period: 'monthly',
	currency: 'COP',
	startsOn: '2026-11-01',
	endsOn: null,
	createdAt: '2026-11-01T05:00:00.000Z',
	limits: [
		{ categoryId: 'rent', limitMinor: 220_000_000, bucket: 'needs', alertThresholdPct: 80 },
		{ categoryId: 'dining', limitMinor: 60_000_000, bucket: 'wants', alertThresholdPct: 80 },
		{ categoryId: 'fun', limitMinor: 40_000_000, bucket: 'wants', alertThresholdPct: 80 }
	]
};

describe('envelopeViews', () => {
	it('joins limits with spending and derives state, pace and allowance', () => {
		const views = envelopeViews(
			budget,
			{
				budgetId: budget.id,
				currency: 'COP',
				envelopes: [
					{ categoryId: 'rent', spentMinor: 220_000_000 },
					{ categoryId: 'dining', spentMinor: 64_000_000 }
				]
			},
			{ day: 20, days: 30 }
		);
		expect(views.map((v) => [v.categoryId, v.state, v.usedPermille, v.remainingMinor])).toEqual([
			['rent', 'warning', 1000, 0],
			['dining', 'over', 1066, -4_000_000],
			// Missing from the spending response: nothing spent yet.
			['fun', 'ok', 0, 40_000_000]
		]);
		expect(views[2]).toMatchObject({ onPace: true, dailyAllowanceMinor: 3_636_363 });
		expect(views[1]!.onPace).toBe(false);
	});
});

describe('monthProgress', () => {
	it('reads the day and the length of the month, leap years included', () => {
		expect(monthProgress('2026-11-20')).toEqual({ day: 20, days: 30 });
		expect(monthProgress('2028-02-29')).toEqual({ day: 29, days: 29 });
		expect(monthProgress('2026-12-01')).toEqual({ day: 1, days: 31 });
	});
});

describe('suggestedBucket', () => {
	it('suggests needs for essentials and wants otherwise', () => {
		expect(suggestedBucket({ name: 'Housing' })).toBe('needs');
		expect(suggestedBucket({ name: 'Dining Out' })).toBe('wants');
		expect(suggestedBucket({ name: 'Mi categoría' })).toBe('wants');
	});
});

describe('limitsFromForm', () => {
	const categories = [{ id: 'rent' }, { id: 'dining' }, { id: 'fun' }];
	const parse = (input: string) => (/^\d+$/.test(input) ? Number(input) * 100 : null);

	it('keeps categories with an amount and reads their bucket', () => {
		const data = new FormData();
		data.set('limit:rent', ' 2200 ');
		data.set('bucket:rent', 'needs');
		data.set('limit:dining', '600');
		data.set('bucket:dining', 'wants');
		data.set('limit:fun', '');
		expect(limitsFromForm(data, categories, parse)).toEqual({
			limits: [
				{ categoryId: 'rent', limitMinor: 220_000, bucket: 'needs' },
				{ categoryId: 'dining', limitMinor: 60_000, bucket: 'wants' }
			]
		});
	});

	it('falls back to needs for an unknown bucket', () => {
		const data = new FormData();
		data.set('limit:rent', '1');
		data.set('bucket:rent', 'luxury');
		expect(limitsFromForm(data, categories, parse)).toEqual({
			limits: [{ categoryId: 'rent', limitMinor: 100, bucket: 'needs' }]
		});
	});

	it('reports the first invalid amount, or no envelopes at all', () => {
		const data = new FormData();
		data.set('limit:dining', 'abc');
		expect(limitsFromForm(data, categories, parse)).toEqual({
			error: 'amount',
			categoryId: 'dining'
		});
		expect(limitsFromForm(new FormData(), categories, parse)).toEqual({ error: 'empty' });
	});
});
