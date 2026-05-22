import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate, formatPercent } from './format.js';

describe('formatCurrency', () => {
  it('formats USD correctly', () => {
    expect(formatCurrency(1234.56, 'usd')).toBe('$1,234.56');
  });

  it('formats EUR correctly with German locale', () => {
    const result = formatCurrency(1234.56, 'eur');
    expect(result).toContain('1.234,56');
    expect(result).toContain('€');
  });

  it('formats COP correctly with Colombian locale', () => {
    const result = formatCurrency(1234567, 'cop');
    expect(result).toContain('1.234.567');
    expect(result).toContain('$');
  });

  it('coerces string amount to number', () => {
    expect(formatCurrency('1234.56', 'usd')).toBe('$1,234.56');
  });

  it('defaults to USD when currency code is omitted', () => {
    expect(formatCurrency(100)).toBe('$100.00');
  });

  it('falls back to USD for unknown currency code', () => {
    expect(formatCurrency(100, 'xyz')).toBe('$100.00');
  });

  it('handles uppercase currency code', () => {
    expect(formatCurrency(100, 'USD')).toBe('$100.00');
  });

  it('handles mixed-case currency code', () => {
    expect(formatCurrency(100, 'Usd')).toBe('$100.00');
  });

  it('formats negative amounts', () => {
    expect(formatCurrency(-500, 'usd')).toBe('-$500.00');
  });

  it('formats zero', () => {
    expect(formatCurrency(0, 'usd')).toBe('$0.00');
  });

  it('formats large numbers', () => {
    expect(formatCurrency(9999999.99, 'usd')).toBe('$9,999,999.99');
  });

  it('returns NaN string for non-numeric string input', () => {
    const result = formatCurrency('abc', 'usd');
    expect(result).toBe('$NaN');
  });
});

describe('formatDate', () => {
  it('formats ISO date string correctly', () => {
    // Use midday UTC to avoid timezone boundary issues
    expect(formatDate('2024-03-15T12:00:00Z')).toBe('Mar 15, 2024');
  });

  it('formats another date', () => {
    // Use midday UTC to avoid timezone boundary issues
    expect(formatDate('2023-12-25T12:00:00Z')).toBe('Dec 25, 2023');
  });

  it('formats date with time portion', () => {
    expect(formatDate('2024-01-01T12:00:00Z')).toBe('Jan 1, 2024');
  });

  it('handles invalid date string gracefully', () => {
    const result = formatDate('not-a-date');
    expect(result).toBe('Invalid Date');
  });

  it('handles empty string', () => {
    const result = formatDate('');
    expect(result).toBe('Invalid Date');
  });
});

describe('formatPercent', () => {
  it('formats positive value with sign', () => {
    expect(formatPercent(3.2)).toBe('+3.2%');
  });

  it('formats negative value', () => {
    expect(formatPercent(-2.5)).toBe('-2.5%');
  });

  it('formats positive value without sign', () => {
    expect(formatPercent(3.2, false)).toBe('3.2%');
  });

  it('formats zero with sign', () => {
    // 0 is not > 0, so no + sign
    expect(formatPercent(0)).toBe('0.0%');
  });

  it('formats zero without sign', () => {
    expect(formatPercent(0, false)).toBe('0.0%');
  });

  it('formats large positive value', () => {
    expect(formatPercent(99.9)).toBe('+99.9%');
  });

  it('formats large negative value', () => {
    expect(formatPercent(-99.9)).toBe('-99.9%');
  });

  it('rounds to one decimal place', () => {
    expect(formatPercent(3.14159)).toBe('+3.1%');
  });
});
