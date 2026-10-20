import { describe, expect, it } from 'vitest';
import { Money, MoneyError, sum } from './money.js';

describe('Money', () => {
	it('stores amounts as bigint minor units', () => {
		const money = Money.of(1250, 'USD');
		expect(money.minor).toBe(1250n);
		expect(money.currency).toBe('USD');
	});

	it('rejects invalid currency codes and unsafe numbers', () => {
		expect(() => Money.of(1, 'usd')).toThrow(MoneyError);
		expect(() => Money.of(1.5, 'USD')).toThrow(MoneyError);
		expect(() => Money.of(Number.MAX_SAFE_INTEGER + 1, 'USD')).toThrow(MoneyError);
	});

	it.each([
		['12.50', 2, 1250n],
		['12.5', 2, 1250n],
		['12', 2, 1200n],
		['-0.01', 2, -1n],
		['1500', 0, 1500n],
		['1.234', 3, 1234n]
	])('parses %s with %i decimals', (input, minorUnit, expected) => {
		expect(Money.parse(input, 'USD', minorUnit).minor).toBe(expected);
	});

	it('rejects malformed or over-precise amounts', () => {
		expect(() => Money.parse('12.345', 'USD', 2)).toThrow(MoneyError);
		expect(() => Money.parse('abc', 'USD', 2)).toThrow(MoneyError);
		expect(() => Money.parse('1,000', 'USD', 2)).toThrow(MoneyError);
	});

	it('formats as a decimal string', () => {
		expect(Money.of(1250, 'USD').toDecimalString(2)).toBe('12.50');
		expect(Money.of(-5, 'USD').toDecimalString(2)).toBe('-0.05');
		expect(Money.of(1500, 'COP').toDecimalString(0)).toBe('1500');
	});

	it('does arithmetic without mutating', () => {
		const a = Money.of(1000, 'USD');
		const b = Money.of(250, 'USD');
		expect(a.add(b).minor).toBe(1250n);
		expect(a.subtract(b).minor).toBe(750n);
		expect(a.negate().minor).toBe(-1000n);
		expect(a.negate().abs().minor).toBe(1000n);
		expect(a.abs()).toBe(a);
		expect(a.minor).toBe(1000n);
	});

	it('compares and inspects sign', () => {
		const a = Money.of(1000, 'USD');
		expect(a.compare(Money.of(999, 'USD'))).toBe(1);
		expect(a.compare(Money.of(1001, 'USD'))).toBe(-1);
		expect(a.compare(Money.of(1000, 'USD'))).toBe(0);
		expect(a.equals(Money.of(1000, 'USD'))).toBe(true);
		expect(a.equals(Money.of(1000, 'EUR'))).toBe(false);
		expect(Money.zero('USD').isZero()).toBe(true);
		expect(a.isPositive()).toBe(true);
		expect(a.negate().isNegative()).toBe(true);
	});

	it('refuses to mix currencies', () => {
		expect(() => Money.of(1, 'USD').add(Money.of(1, 'EUR'))).toThrow(MoneyError);
		expect(() => Money.of(1, 'USD').compare(Money.of(1, 'EUR'))).toThrow(MoneyError);
	});

	it('sums a list of amounts', () => {
		expect(sum([Money.of(100, 'USD'), Money.of(250, 'USD')], 'USD').minor).toBe(350n);
		expect(sum([], 'USD').isZero()).toBe(true);
	});
});
