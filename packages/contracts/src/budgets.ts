import { z } from 'zod';
import { currencyCode, id, isoDateTime, positiveAmountMinor } from './common.js';

/** 50/30/20 grouping of envelopes: needs (50%), wants (30%) and savings (20%). */
export const budgetBucket = z.enum(['needs', 'wants', 'savings']);
export type BudgetBucket = z.infer<typeof budgetBucket>;

/** Calendar date, e.g. "2026-11-01". */
const isoDate = z.iso.date();

/** One envelope: a monthly spending limit for an expense category. */
export const budgetLimitSchema = z.object({
	categoryId: id,
	limitMinor: positiveAmountMinor,
	bucket: budgetBucket,
	/** Percentage of the limit at which the envelope counts as "near the limit". */
	alertThresholdPct: z.number().int().min(1).max(100).default(80)
});
export type BudgetLimitInput = z.input<typeof budgetLimitSchema>;
export type BudgetLimit = z.output<typeof budgetLimitSchema>;

const limits = z
	.array(budgetLimitSchema)
	.min(1)
	.max(100)
	.refine((items) => new Set(items.map((item) => item.categoryId)).size === items.length, {
		message: 'Each category can only have one envelope'
	});

export const createBudgetSchema = z.object({
	name: z.string().trim().min(1).max(80),
	currency: currencyCode,
	/** First day the budget applies; defaults to today. */
	startsOn: isoDate.optional(),
	limits
});
export type CreateBudgetInput = z.input<typeof createBudgetSchema>;

/** Replaces the budget's name and its whole set of envelopes. */
export const updateBudgetSchema = z.object({
	name: z.string().trim().min(1).max(80),
	limits
});
export type UpdateBudgetInput = z.input<typeof updateBudgetSchema>;

export const budgetSchema = z.object({
	id,
	name: z.string(),
	period: z.enum(['weekly', 'monthly', 'quarterly', 'yearly']),
	currency: currencyCode,
	startsOn: isoDate,
	endsOn: isoDate.nullable(),
	limits: z.array(budgetLimitSchema),
	createdAt: isoDateTime
});
export type Budget = z.infer<typeof budgetSchema>;

export const budgetSpendingQuerySchema = z.object({
	from: isoDateTime,
	/** Exclusive, like the transaction summary. */
	to: isoDateTime
});
export type BudgetSpendingQuery = z.infer<typeof budgetSpendingQuerySchema>;

/**
 * Expenses per envelope in `[from, to)`, only from accounts in the budget's currency.
 * An envelope also counts expenses in its category's subcategories.
 */
export const budgetSpendingSchema = z.object({
	budgetId: id,
	currency: currencyCode,
	envelopes: z.array(z.object({ categoryId: id, spentMinor: z.number().int() }))
});
export type BudgetSpending = z.infer<typeof budgetSpendingSchema>;
