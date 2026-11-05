import { describe, expect, it } from 'vitest';
import { contributionMonths, monthlyContributionMinor } from './goal.js';

describe('contributionMonths', () => {
	it('counts the current month through the target month', () => {
		expect(contributionMonths('2026-11-05', '2027-03-31')).toBe(5);
		expect(contributionMonths('2026-11-05', '2026-11-30')).toBe(1);
		expect(contributionMonths('2026-11-05', '2026-11-05')).toBe(1);
		expect(contributionMonths('2026-12-31', '2027-01-01')).toBe(2);
	});

	it('is 0 once the target date has passed', () => {
		expect(contributionMonths('2026-11-05', '2026-11-04')).toBe(0);
		expect(contributionMonths('2026-11-05', '2025-12-31')).toBe(0);
	});

	it('rejects malformed dates', () => {
		expect(() => contributionMonths('2026-11-05', '2027-3-1')).toThrow(RangeError);
	});
});

describe('monthlyContributionMinor', () => {
	it('splits what is left over the months, rounding up', () => {
		expect(monthlyContributionMinor({ targetMinor: 1000, savedMinor: 0 }, 3)).toBe(334);
		expect(monthlyContributionMinor({ targetMinor: 800_000_000, savedMinor: 560_000_000 }, 8)).toBe(
			30_000_000
		);
	});

	it('is 0 when the goal is reached, and null when no months are left', () => {
		expect(monthlyContributionMinor({ targetMinor: 1000, savedMinor: 1200 }, 3)).toBe(0);
		expect(monthlyContributionMinor({ targetMinor: 1000, savedMinor: 1000 }, 0)).toBe(0);
		expect(monthlyContributionMinor({ targetMinor: 1000, savedMinor: 10 }, 0)).toBeNull();
	});
});
