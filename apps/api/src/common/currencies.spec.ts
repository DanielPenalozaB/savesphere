import { SUPPORTED_CURRENCIES } from '@savesphere/contracts';
import { CURRENCIES } from '@savesphere/db';

describe('currency lists', () => {
	it('keeps the client list in sync with the database seed', () => {
		expect(SUPPORTED_CURRENCIES.map(({ code, minorUnit }) => ({ code, minorUnit }))).toEqual(
			CURRENCIES.map(({ code, minorUnit }) => ({ code, minorUnit }))
		);
	});
});
