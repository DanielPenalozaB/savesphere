import { describe, expect, it } from 'vitest';
import {
	monthRange,
	parseMonth,
	shiftMonth,
	zonedDate,
	zonedTimeToUtc,
	zonedYearMonth
} from './dates.ts';

describe('time zones', () => {
	it('reads the local month and date of an instant', () => {
		// 03:00 UTC on Nov 1 is still Oct 31 in Bogotá (UTC-5).
		const instant = new Date('2026-11-01T03:00:00Z');
		expect(zonedYearMonth(instant, 'America/Bogota')).toEqual({ year: 2026, month: 10 });
		expect(zonedDate(instant, 'America/Bogota')).toBe('2026-10-31');
		expect(zonedDate(instant, 'UTC')).toBe('2026-11-01');
	});

	it('converts local wall-clock times to UTC, including across DST', () => {
		expect(zonedTimeToUtc('2026-10-01', '00:00', 'America/Bogota').toISOString()).toBe(
			'2026-10-01T05:00:00.000Z'
		);
		expect(zonedTimeToUtc('2026-07-01', '12:00', 'Europe/Madrid').toISOString()).toBe(
			'2026-07-01T10:00:00.000Z'
		);
		expect(zonedTimeToUtc('2026-12-01', '12:00', 'Europe/Madrid').toISOString()).toBe(
			'2026-12-01T11:00:00.000Z'
		);
	});

	it('builds an exclusive month range, rolling over the year', () => {
		expect(monthRange(2026, 12, 'America/Bogota')).toEqual({
			from: '2026-12-01T05:00:00.000Z',
			to: '2027-01-01T05:00:00.000Z'
		});
	});
});

describe('month params', () => {
	it('parses and shifts months', () => {
		expect(parseMonth('2026-10')).toEqual({ year: 2026, month: 10 });
		expect(parseMonth('2026-13')).toBeNull();
		expect(parseMonth(null)).toBeNull();
		expect(shiftMonth({ year: 2026, month: 1 }, -1)).toEqual({ year: 2025, month: 12 });
		expect(shiftMonth({ year: 2026, month: 12 }, 1)).toEqual({ year: 2027, month: 1 });
	});
});
