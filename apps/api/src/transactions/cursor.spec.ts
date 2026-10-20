import { decodeCursor, encodeCursor } from './cursor.js';

describe('cursor', () => {
	it('round-trips', () => {
		const cursor = {
			occurredAt: new Date('2026-01-02T03:04:05.678Z'),
			id: '01a157d5-d434-719c-88bd-1cea368fca52'
		};
		expect(decodeCursor(encodeCursor(cursor))).toEqual(cursor);
	});

	it('rejects garbage', () => {
		expect(decodeCursor('not-a-cursor')).toBeNull();
		expect(decodeCursor(Buffer.from('nope|').toString('base64url'))).toBeNull();
	});
});
