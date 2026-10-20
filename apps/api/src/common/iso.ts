export const iso = (date: Date | null): string | null => (date ? date.toISOString() : null);

/** Converts a bigint from the database to a JSON-safe number, refusing silent precision loss. */
export function toSafeNumber(value: bigint): number {
	if (value > BigInt(Number.MAX_SAFE_INTEGER) || value < BigInt(Number.MIN_SAFE_INTEGER)) {
		throw new RangeError(`Amount ${value} exceeds the safe integer range`);
	}
	return Number(value);
}
