import type { Account, Goal } from '@savesphere/contracts';
import { describe, expect, it } from 'vitest';
import { balanceSheet, goalProgress, isLiability, sortGoals } from './goals.ts';

const goal = (overrides: Partial<Goal>): Goal => ({
	id: '00000000-0000-7000-8000-000000000001',
	name: 'Kioto',
	targetMinor: 800_000_000,
	savedMinor: 560_000_000,
	currency: 'COP',
	targetDate: '2027-06-30',
	status: 'active',
	icon: null,
	achievedAt: null,
	createdAt: '2026-01-01T00:00:00.000Z',
	...overrides
});

const account = (overrides: Partial<Account>): Account => ({
	id: '00000000-0000-7000-8000-00000000000a',
	name: 'Account',
	kind: 'checking',
	currency: 'COP',
	includeInTotals: true,
	balanceMinor: 0,
	archivedAt: null,
	createdAt: '2026-01-01T00:00:00.000Z',
	...overrides
});

describe('goalProgress', () => {
	it('derives the share saved and the monthly amount to arrive on time', () => {
		expect(goalProgress(goal({}), '2026-11-05')).toEqual({
			permille: 700,
			reached: false,
			months: 8,
			monthlyMinor: 30_000_000,
			overdue: false
		});
	});

	it('handles goals without a date, reached goals and overdue goals', () => {
		expect(goalProgress(goal({ targetDate: null }), '2026-11-05')).toMatchObject({
			months: null,
			monthlyMinor: null,
			overdue: false
		});
		expect(goalProgress(goal({ savedMinor: 900_000_000 }), '2026-11-05')).toMatchObject({
			permille: 1000,
			reached: true,
			monthlyMinor: 0
		});
		expect(goalProgress(goal({ targetDate: '2026-10-31' }), '2026-11-05')).toMatchObject({
			months: 0,
			monthlyMinor: null,
			overdue: true
		});
	});
});

describe('sortGoals', () => {
	it('puts active goals first and keeps the order within a status', () => {
		const sorted = sortGoals([
			goal({ id: 'a', status: 'achieved' }),
			goal({ id: 'b', status: 'active' }),
			goal({ id: 'c', status: 'paused' }),
			goal({ id: 'd', status: 'active' })
		]);
		expect(sorted.map((g) => g.id)).toEqual(['b', 'd', 'c', 'a']);
	});
});

describe('balanceSheet', () => {
	it('splits counted accounts in one currency into assets and liabilities', () => {
		const sheet = balanceSheet(
			[
				account({ id: 'checking', balanceMinor: 2_432_000_000 }),
				account({ id: 'card', kind: 'credit_card', balanceMinor: -184_000_000 }),
				account({ id: 'brokerage', kind: 'investment', balanceMinor: 21_418_000_000 }),
				account({ id: 'loan', kind: 'loan', balanceMinor: -3_725_000_000 }),
				account({ id: 'usd', currency: 'USD', balanceMinor: 100_000 }),
				account({ id: 'hidden', includeInTotals: false, balanceMinor: 999 })
			],
			'COP'
		);
		expect(sheet.assetsMinor).toBe(23_850_000_000);
		expect(sheet.liabilitiesMinor).toBe(3_909_000_000);
		expect(sheet.netMinor).toBe(19_941_000_000);
		expect(sheet.accounts.map((a) => a.id)).toEqual(['brokerage', 'checking', 'loan', 'card']);
	});

	it('is empty when nothing is in the currency', () => {
		expect(balanceSheet([], 'COP')).toEqual({
			accounts: [],
			assetsMinor: 0,
			liabilitiesMinor: 0,
			netMinor: 0
		});
	});
});

describe('isLiability', () => {
	it('treats cards and loans as liabilities', () => {
		expect(isLiability({ kind: 'loan' })).toBe(true);
		expect(isLiability({ kind: 'credit_card' })).toBe(true);
		expect(isLiability({ kind: 'savings' })).toBe(false);
	});
});

describe('goalProgress rounding', () => {
	it('rounds the monthly amount up to a whole currency unit', () => {
		// 1.600.000 COP left over 12 months = 133.333,33… → 133.334.
		expect(
			goalProgress(
				goal({ targetMinor: 800_000_000, savedMinor: 640_000_000, targetDate: '2027-10-31' }),
				'2026-11-05'
			).monthlyMinor
		).toBe(13_333_400);
	});
});
