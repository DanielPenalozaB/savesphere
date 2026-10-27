import { describe, expect, it } from 'vitest';
import { categoryLabel, sortCategories } from './categories.ts';

describe('categories', () => {
	it('translates starter categories but keeps custom names', () => {
		expect(categoryLabel({ name: 'Dining Out' })).toBe('Dining out');
		expect(categoryLabel({ name: 'Café con amigos' })).toBe('Café con amigos');
	});

	it('sorts alphabetically by label with "Other" last', () => {
		const sorted = sortCategories(
			[{ name: 'Other' }, { name: 'Transport' }, { name: 'Housing' }, { name: 'Dining Out' }],
			'en'
		);
		expect(sorted.map((c) => c.name)).toEqual(['Dining Out', 'Housing', 'Transport', 'Other']);
	});
});
