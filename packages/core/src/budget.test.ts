import { describe, expect, it } from 'vitest';
import {
	bucketTotals,
	dailyAllowanceMinor,
	disciplineScore,
	envelopeState,
	isOnPace,
	permille,
	remainingMinor
} from './budget.js';

describe('permille', () => {
	it('returns tenths of a percent, rounded down', () => {
		expect(permille(620_000_00, 800_000_00)).toBe(775);
		expect(permille(1, 3)).toBe(333);
		expect(permille(640, 600)).toBe(1066);
	});

	it('is 0 for an empty or negative whole', () => {
		expect(permille(5, 0)).toBe(0);
		expect(permille(5, -1)).toBe(0);
	});

	it('stays exact for amounts near the safe-integer limit', () => {
		const big = Number.MAX_SAFE_INTEGER;
		expect(permille(big, big)).toBe(1000);
	});
});

describe('envelopeState', () => {
	const envelope = (spentMinor: number) => ({
		limitMinor: 1000,
		spentMinor,
		alertThresholdPct: 80
	});

	it('is ok under the threshold, warning from it, over past the limit', () => {
		expect(envelopeState(envelope(0))).toBe('ok');
		expect(envelopeState(envelope(799))).toBe('ok');
		expect(envelopeState(envelope(800))).toBe('warning');
		expect(envelopeState(envelope(1000))).toBe('warning');
		expect(envelopeState(envelope(1001))).toBe('over');
	});

	it('warns only at the limit with a 100% threshold', () => {
		expect(envelopeState({ limitMinor: 10, spentMinor: 9, alertThresholdPct: 100 })).toBe('ok');
		expect(envelopeState({ limitMinor: 10, spentMinor: 10, alertThresholdPct: 100 })).toBe(
			'warning'
		);
	});
});

describe('remainingMinor', () => {
	it('is negative when overspent', () => {
		expect(remainingMinor({ limitMinor: 600, spentMinor: 640 })).toBe(-40);
		expect(remainingMinor({ limitMinor: 600, spentMinor: 100 })).toBe(500);
	});
});

describe('isOnPace', () => {
	const limit = { limitMinor: 3000 };

	it('compares spending with a straight line through the period', () => {
		expect(isOnPace({ ...limit, spentMinor: 1000 }, { day: 10, days: 30 })).toBe(true);
		expect(isOnPace({ ...limit, spentMinor: 1001 }, { day: 10, days: 30 })).toBe(false);
		expect(isOnPace({ ...limit, spentMinor: 3000 }, { day: 30, days: 30 })).toBe(true);
	});

	it('rejects impossible days', () => {
		expect(() => isOnPace({ ...limit, spentMinor: 0 }, { day: 0, days: 30 })).toThrow(RangeError);
		expect(() => isOnPace({ ...limit, spentMinor: 0 }, { day: 31, days: 30 })).toThrow(RangeError);
		expect(() => isOnPace({ ...limit, spentMinor: 0 }, { day: 1.5, days: 30 })).toThrow(RangeError);
	});
});

describe('dailyAllowanceMinor', () => {
	it('splits what is left over the remaining days, today included, rounding down', () => {
		// 180.000 left over days 20–31 (12 days).
		expect(
			dailyAllowanceMinor({ limitMinor: 800_000, spentMinor: 620_000 }, { day: 20, days: 31 })
		).toBe(15_000);
		expect(dailyAllowanceMinor({ limitMinor: 10, spentMinor: 0 }, { day: 1, days: 3 })).toBe(3);
		expect(dailyAllowanceMinor({ limitMinor: 10, spentMinor: 0 }, { day: 3, days: 3 })).toBe(10);
	});

	it('is 0 when nothing is left', () => {
		expect(dailyAllowanceMinor({ limitMinor: 10, spentMinor: 10 }, { day: 5, days: 30 })).toBe(0);
		expect(dailyAllowanceMinor({ limitMinor: 10, spentMinor: 12 }, { day: 5, days: 30 })).toBe(0);
	});
});

describe('bucketTotals', () => {
	it('sums limits and spending per bucket, keeping empty buckets', () => {
		expect(
			bucketTotals([
				{ bucket: 'needs', limitMinor: 220, spentMinor: 220 },
				{ bucket: 'needs', limitMinor: 80, spentMinor: 62 },
				{ bucket: 'wants', limitMinor: 60, spentMinor: 64 }
			])
		).toEqual({
			needs: { limitMinor: 300, spentMinor: 282 },
			wants: { limitMinor: 60, spentMinor: 64 },
			savings: { limitMinor: 0, spentMinor: 0 }
		});
	});
});

describe('disciplineScore', () => {
	const at = (spentMinor: number) => ({ limitMinor: 100, spentMinor, alertThresholdPct: 80 });

	it('is the share of envelopes that are not overspent', () => {
		expect(disciplineScore([at(10), at(90), at(100), at(150)])).toBe(75);
		expect(disciplineScore([at(10), at(200), at(300)])).toBe(33);
	});

	it('is 100 with no envelopes', () => {
		expect(disciplineScore([])).toBe(100);
	});
});
