import { describe, expect, it } from 'vitest';
import { regionalSettings } from './regional.ts';

const form = (fields: Record<string, string>) => {
	const data = new FormData();
	for (const [key, value] of Object.entries(fields)) data.set(key, value);
	return data;
};

describe('regionalSettings', () => {
	it('keeps valid values, canonicalising the locale', () => {
		expect(regionalSettings(form({ timezone: 'America/Bogota', locale: 'es-co' }))).toEqual({
			timezone: 'America/Bogota',
			locale: 'es-CO'
		});
	});

	it('drops invalid or missing values', () => {
		expect(regionalSettings(form({ timezone: 'Mars/Base', locale: '!!' }))).toEqual({});
		expect(regionalSettings(form({}))).toEqual({});
	});
});
