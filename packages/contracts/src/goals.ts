import { z } from 'zod';
import { amountMinor, currencyCode, id, isoDateTime, positiveAmountMinor } from './common.js';

export const goalStatus = z.enum(['active', 'achieved', 'paused', 'abandoned']);
export type GoalStatus = z.infer<typeof goalStatus>;

/** Calendar date, e.g. "2027-03-31". */
const isoDate = z.iso.date();

export const createGoalSchema = z.object({
	name: z.string().trim().min(1).max(80),
	targetMinor: positiveAmountMinor,
	currency: currencyCode,
	targetDate: isoDate.optional()
});
export type CreateGoalInput = z.infer<typeof createGoalSchema>;

/** Partial update. `targetDate: null` clears the date; "achieved" stamps `achievedAt`. */
export const updateGoalSchema = z
	.object({
		name: z.string().trim().min(1).max(80),
		targetMinor: positiveAmountMinor,
		targetDate: isoDate.nullable(),
		status: goalStatus
	})
	.partial()
	.refine((value) => Object.keys(value).length > 0, { message: 'Nothing to update' });
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;

/**
 * Money set aside for (positive) or taken back from (negative) a goal. Earmarks only: account
 * balances don't change.
 */
export const createGoalAllocationSchema = z.object({
	amountMinor: amountMinor.refine((value) => value !== 0, { message: 'Must not be zero' }),
	/** Defaults to today (UTC). */
	allocatedOn: isoDate.optional(),
	note: z.string().trim().max(200).optional()
});
export type CreateGoalAllocationInput = z.infer<typeof createGoalAllocationSchema>;

export const goalSchema = z.object({
	id,
	name: z.string(),
	targetMinor: z.number().int(),
	/** Sum of the goal's allocations (withdrawals subtract). */
	savedMinor: z.number().int(),
	currency: currencyCode,
	targetDate: isoDate.nullable(),
	status: goalStatus,
	icon: z.string().nullable(),
	achievedAt: isoDateTime.nullable(),
	createdAt: isoDateTime
});
export type Goal = z.infer<typeof goalSchema>;
