import { z } from 'zod';
import { amountMinor, currencyCode, id, isoDateTime } from './common.js';

export const accountKind = z.enum([
	'cash',
	'checking',
	'savings',
	'credit_card',
	'investment',
	'loan',
	'other'
]);
export type AccountKind = z.infer<typeof accountKind>;

export const createAccountSchema = z.object({
	name: z.string().trim().min(1).max(80),
	kind: accountKind,
	currency: currencyCode,
	includeInTotals: z.boolean().default(true),
	/** Optional opening balance, recorded as an adjustment transaction. */
	openingBalanceMinor: amountMinor.optional()
});
export type CreateAccountInput = z.infer<typeof createAccountSchema>;

export const updateAccountSchema = z
	.object({
		name: z.string().trim().min(1).max(80),
		includeInTotals: z.boolean(),
		archived: z.boolean()
	})
	.partial();
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;

export const accountSchema = z.object({
	id,
	name: z.string(),
	kind: accountKind,
	currency: currencyCode,
	includeInTotals: z.boolean(),
	balanceMinor: amountMinor,
	archivedAt: isoDateTime.nullable(),
	createdAt: isoDateTime
});
export type Account = z.infer<typeof accountSchema>;
