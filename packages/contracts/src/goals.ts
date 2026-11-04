import { z } from 'zod';
import { currencyCode, id, isoDateTime, positiveAmountMinor } from './common.js';

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
	createdAt: isoDateTime
});
export type Goal = z.infer<typeof goalSchema>;
