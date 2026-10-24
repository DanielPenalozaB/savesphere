import { describe, expect, it } from 'vitest';
import { isActive } from './navigation.ts';

describe('isActive', () => {
	it('matches home only on the exact root', () => {
		expect(isActive('', '/')).toBe(true);
		expect(isActive('', '/budgets')).toBe(false);
	});

	it('matches a section and its sub-pages, but not look-alike prefixes', () => {
		expect(isActive('settings', '/settings')).toBe(true);
		expect(isActive('settings', '/settings/ai')).toBe(true);
		expect(isActive('goals', '/goalsx')).toBe(false);
	});
});
