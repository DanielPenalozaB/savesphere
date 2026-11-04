import { describe, expect, it } from 'vitest';
import { formatLocale } from './locale.ts';

describe('formatLocale', () => {
	it('uses the regional locale only when it matches the UI language', () => {
		expect(formatLocale('es', 'es-CO')).toBe('es-CO');
		expect(formatLocale('en', 'es-CO')).toBe('en');
		expect(formatLocale('es', undefined)).toBe('es');
	});
});
