import { z } from 'zod';
import { amountMinor, id, isoDateTime, positiveAmountMinor } from './common.js';

export const transactionKind = z.enum(['expense', 'income', 'transfer', 'adjustment']);
export type TransactionKind = z.infer<typeof transactionKind>;

export const transactionSource = z.enum([
	'app',
	'whatsapp',
	'telegram',
	'import',
	'recurring',
	'api'
]);

const baseTransaction = {
	occurredAt: isoDateTime,
	description: z.string().trim().max(200).optional(),
	note: z.string().trim().max(1000).optional(),
	/** Client-generated idempotency key, so offline retries never create duplicates. */
	clientRef: id.optional()
};

export const createTransactionSchema = z.discriminatedUnion('kind', [
	z.object({
		kind: z.literal('expense'),
		accountId: id,
		categoryId: id,
		amountMinor: positiveAmountMinor,
		...baseTransaction
	}),
	z.object({
		kind: z.literal('income'),
		accountId: id,
		categoryId: id,
		amountMinor: positiveAmountMinor,
		...baseTransaction
	}),
	z.object({
		kind: z.literal('transfer'),
		fromAccountId: id,
		toAccountId: id,
		amountMinor: positiveAmountMinor,
		toAmountMinor: positiveAmountMinor.optional(),
		...baseTransaction
	}),
	z.object({
		kind: z.literal('adjustment'),
		accountId: id,
		amountMinor: amountMinor.refine((value) => value !== 0, 'Cannot be zero'),
		...baseTransaction
	})
]);
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;

export const listTransactionsQuerySchema = z.object({
	accountId: id.optional(),
	categoryId: id.optional(),
	kind: transactionKind.optional(),
	from: isoDateTime.optional(),
	to: isoDateTime.optional(),
	limit: z.coerce.number().int().min(1).max(100).default(50),
	/** Opaque cursor returned as `nextCursor` by the previous page. */
	cursor: z.string().optional()
});
export type ListTransactionsQuery = z.infer<typeof listTransactionsQuerySchema>;

export const transactionEntrySchema = z.object({
	accountId: id,
	amountMinor
});

export const transactionSchema = z.object({
	id,
	kind: transactionKind,
	categoryId: id.nullable(),
	occurredAt: isoDateTime,
	description: z.string().nullable(),
	note: z.string().nullable(),
	source: transactionSource,
	entries: z.array(transactionEntrySchema),
	createdAt: isoDateTime
});
export type Transaction = z.infer<typeof transactionSchema>;

export const transactionPageSchema = z.object({
	items: z.array(transactionSchema),
	nextCursor: z.string().nullable()
});
export type TransactionPage = z.infer<typeof transactionPageSchema>;
