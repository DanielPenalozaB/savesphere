import { describe, expect, it } from 'vitest';
import { formatMoney, parseAmount, toDecimalString } from './money.ts';

const nbsp = (text: string) => text.replace(/[\u00a0\u202f]/g, ' ');

describe('toDecimalString', () => {
	it.each([
		[1250, 2, '12.50'],
		[-5, 2, '-0.05'],
		[0, 2, '0.00'],
		[1500, 0, '1500']
	])('%i with %i minor digits → %s', (minor, unit, expected) => {
		expect(toDecimalString(minor, unit)).toBe(expected);
	});
});

describe('formatMoney', () => {
	it('drops decimals for whole amounts, as the design shows pesos', () => {
		expect(nbsp(formatMoney(4_732_000_000, 'COP', 'es-CO'))).toBe('$ 47.320.000');
		expect(formatMoney(4_732_000_000, 'COP', 'en')).toBe('$47,320,000');
	});

	it('shows all minor digits otherwise', () => {
		expect(formatMoney(1250, 'USD', 'en')).toBe('$12.50');
		expect(formatMoney(1205, 'USD', 'en')).toBe('$12.05');
	});

	it('can sign income and hide the symbol', () => {
		expect(formatMoney(350_000, 'USD', 'en', { signed: true })).toBe('+$3,500');
		expect(formatMoney(-2_850_000, 'COP', 'en', { signed: true })).toBe('-$28,500');
		expect(formatMoney(150_000, 'COP', 'en', { plain: true })).toBe('1,500');
	});

	it('respects currencies without minor units', () => {
		expect(formatMoney(1500, 'CLP', 'en')).toBe('$1,500');
	});
});

describe('parseAmount', () => {
	it('reads Spanish grouping and decimals', () => {
		expect(parseAmount('25.000', 'COP', 'es')).toBe(2_500_000);
		expect(parseAmount('1.250.000,50', 'COP', 'es')).toBe(125_000_050);
		expect(parseAmount('12,5', 'USD', 'es')).toBe(1250);
	});

	it('reads English grouping and decimals', () => {
		expect(parseAmount('25,000', 'COP', 'en')).toBe(2_500_000);
		expect(parseAmount('$ 12.50', 'USD', 'en')).toBe(1250);
		expect(parseAmount('7', 'USD', 'en')).toBe(700);
	});

	it('rejects junk, zero, negatives and extra decimals', () => {
		for (const input of ['', 'abc', '0', '-5', '1.234', '12..5']) {
			expect(parseAmount(input, 'USD', 'en'), input).toBeNull();
		}
		expect(parseAmount('10,5', 'CLP', 'es')).toBeNull();
	});
});
