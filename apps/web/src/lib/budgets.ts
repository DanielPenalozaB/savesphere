import type {
	Budget,
	BudgetBucket,
	BudgetSpending,
	Category,
	CreateBudgetInput
} from '@savesphere/contracts';
import {
	dailyAllowanceMinor,
	envelopeState,
	isOnPace,
	permille,
	remainingMinor,
	type EnvelopeState,
	type PeriodProgress
} from '@savesphere/core';

export const BUCKETS: BudgetBucket[] = ['needs', 'wants', 'savings'];

/** The 50/30/20 rule's target share of the total limit per bucket, in percent. */
export const BUCKET_TARGET_PCT: Record<BudgetBucket, number> = {
	needs: 50,
	wants: 30,
	savings: 20
};

/** Suggested bucket for the starter categories (by their stored English name); "wants" otherwise. */
const NEEDS = new Set([
	'Housing',
	'Food & Groceries',
	'Transport',
	'Utilities',
	'Health',
	'Education'
]);

export function suggestedBucket(category: Pick<Category, 'name'>): BudgetBucket {
	return NEEDS.has(category.name) ? 'needs' : 'wants';
}

export interface EnvelopeView {
	categoryId: string;
	bucket: BudgetBucket;
	limitMinor: number;
	spentMinor: number;
	remainingMinor: number;
	/** Spent share of the limit in tenths of a percent (may exceed 1000). */
	usedPermille: number;
	state: EnvelopeState;
	onPace: boolean;
	dailyAllowanceMinor: number;
}

/** Joins the budget's envelopes with their spending and derives what the page shows. */
export function envelopeViews(
	budget: Budget,
	spending: BudgetSpending,
	progress: PeriodProgress
): EnvelopeView[] {
	const spent = new Map(spending.envelopes.map((e) => [e.categoryId, e.spentMinor]));
	return budget.limits.map((limit) => {
		const envelope = {
			limitMinor: limit.limitMinor,
			spentMinor: spent.get(limit.categoryId) ?? 0,
			alertThresholdPct: limit.alertThresholdPct
		};
		return {
			categoryId: limit.categoryId,
			bucket: limit.bucket,
			limitMinor: envelope.limitMinor,
			spentMinor: envelope.spentMinor,
			remainingMinor: remainingMinor(envelope),
			usedPermille: permille(envelope.spentMinor, envelope.limitMinor),
			state: envelopeState(envelope),
			onPace: isOnPace(envelope, progress),
			dailyAllowanceMinor: dailyAllowanceMinor(envelope, progress)
		};
	});
}

/** Day of the month and days in it, from a calendar date like "2026-11-20". */
export function monthProgress(today: string): PeriodProgress {
	const [year, month, day] = today.split('-').map(Number) as [number, number, number];
	return { day, days: new Date(Date.UTC(year, month, 0)).getUTCDate() };
}

export type BudgetFormError =
	{ error: 'name' | 'empty' | 'generic' } | { error: 'amount'; categoryId: string };

/** The envelopes' form fields: `limit:<categoryId>` (amount) and `bucket:<categoryId>`. */
export function limitsFromForm(
	data: FormData,
	categories: Pick<Category, 'id'>[],
	parse: (input: string) => number | null
):
	| { limits: CreateBudgetInput['limits'] }
	| { error: 'amount'; categoryId: string }
	| { error: 'empty' } {
	const limits: CreateBudgetInput['limits'] = [];
	for (const category of categories) {
		const raw = data.get(`limit:${category.id}`);
		const text = typeof raw === 'string' ? raw.trim() : '';
		if (!text) continue;
		const limitMinor = parse(text);
		if (limitMinor === null) return { error: 'amount', categoryId: category.id };
		const bucket = data.get(`bucket:${category.id}`);
		limits.push({
			categoryId: category.id,
			limitMinor,
			bucket: BUCKETS.includes(bucket as BudgetBucket) ? (bucket as BudgetBucket) : 'needs'
		});
	}
	return limits.length > 0 ? { limits } : { error: 'empty' };
}
