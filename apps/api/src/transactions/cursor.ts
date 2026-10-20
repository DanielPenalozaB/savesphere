export interface Cursor {
	occurredAt: Date;
	id: string;
}

export function encodeCursor(cursor: Cursor): string {
	return Buffer.from(`${cursor.occurredAt.toISOString()}|${cursor.id}`).toString('base64url');
}

export function decodeCursor(value: string): Cursor | null {
	const [occurredAt, id] = Buffer.from(value, 'base64url').toString('utf8').split('|');
	const date = new Date(occurredAt ?? '');
	if (!id || Number.isNaN(date.getTime())) return null;
	return { occurredAt: date, id };
}
