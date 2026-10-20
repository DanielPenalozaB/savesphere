/** Extracts the Postgres error (code / constraint) that drizzle wraps in `cause`. */
export function pgError(error: unknown): { code?: string; constraint?: string } | undefined {
	let current: unknown = error;
	for (let depth = 0; depth < 3 && current && typeof current === 'object'; depth++) {
		const candidate = current as { code?: unknown; constraint?: unknown; cause?: unknown };
		if (typeof candidate.code === 'string' && /^[0-9A-Z]{5}$/.test(candidate.code)) {
			return {
				code: candidate.code,
				constraint: typeof candidate.constraint === 'string' ? candidate.constraint : undefined
			};
		}
		current = candidate.cause;
	}
	return undefined;
}

export const PG_UNIQUE_VIOLATION = '23505';
export const PG_FOREIGN_KEY_VIOLATION = '23503';
