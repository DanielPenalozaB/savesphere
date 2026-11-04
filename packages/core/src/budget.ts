/**
 * Pure budget maths on integer minor units. Amounts are `number`s that are safe integers (as the
 * API sends them); intermediate products use bigint so they never lose precision.
 */

export type BudgetBucket = 'needs' | 'wants' | 'savings';

/** "ok" under the alert threshold, "warning" at or past it, "over" past the limit. */
export type EnvelopeState = 'ok' | 'warning' | 'over';

export interface Envelope {
	limitMinor: number;
	spentMinor: number;
	/** 1–100: the share of the limit at which the envelope warns. */
	alertThresholdPct: number;
}

/** Share of `whole` that `part` is, in tenths of a percent (e.g. 775 = 77.5%), rounded down. */
export function permille(part: number, whole: number): number {
	if (whole <= 0) return 0;
	return Number((BigInt(part) * 1000n) / BigInt(whole));
}

export function envelopeState({
	limitMinor,
	spentMinor,
	alertThresholdPct
}: Envelope): EnvelopeState {
	if (spentMinor > limitMinor) return 'over';
	// spent / limit >= threshold%, without division.
	if (BigInt(spentMinor) * 100n >= BigInt(limitMinor) * BigInt(alertThresholdPct)) return 'warning';
	return 'ok';
}

/** What is left of the limit; negative when the envelope is overspent. */
export function remainingMinor({
	limitMinor,
	spentMinor
}: Pick<Envelope, 'limitMinor' | 'spentMinor'>) {
	return limitMinor - spentMinor;
}

export interface PeriodProgress {
	/** 1-based day of the period, e.g. 20 on the 20th of the month. */
	day: number;
	/** Days in the period, e.g. 31. */
	days: number;
}

/**
 * Whether spending is at or below a straight-line pace through the period: by day 10 of 30, up to
 * a third of the limit. The last day of the period allows the whole limit.
 */
export function isOnPace(
	{ limitMinor, spentMinor }: Pick<Envelope, 'limitMinor' | 'spentMinor'>,
	{ day, days }: PeriodProgress
): boolean {
	assertProgress({ day, days });
	return BigInt(spentMinor) * BigInt(days) <= BigInt(limitMinor) * BigInt(day);
}

/**
 * How much can be spent per remaining day (today included) without passing the limit, rounded
 * down to a whole minor unit; 0 when nothing is left.
 */
export function dailyAllowanceMinor(
	envelope: Pick<Envelope, 'limitMinor' | 'spentMinor'>,
	{ day, days }: PeriodProgress
): number {
	assertProgress({ day, days });
	const left = remainingMinor(envelope);
	if (left <= 0) return 0;
	return Number(BigInt(left) / BigInt(days - day + 1));
}

export interface BucketTotals {
	limitMinor: number;
	spentMinor: number;
}

/** Limits and spending summed per 50/30/20 bucket; every bucket is present. */
export function bucketTotals(
	envelopes: (Pick<Envelope, 'limitMinor' | 'spentMinor'> & { bucket: BudgetBucket })[]
): Record<BudgetBucket, BucketTotals> {
	const totals: Record<BudgetBucket, BucketTotals> = {
		needs: { limitMinor: 0, spentMinor: 0 },
		wants: { limitMinor: 0, spentMinor: 0 },
		savings: { limitMinor: 0, spentMinor: 0 }
	};
	for (const envelope of envelopes) {
		totals[envelope.bucket].limitMinor += envelope.limitMinor;
		totals[envelope.bucket].spentMinor += envelope.spentMinor;
	}
	return totals;
}

/** Share of envelopes (0–100, rounded down) that are not overspent; 100 with no envelopes. */
export function disciplineScore(envelopes: Envelope[]): number {
	if (envelopes.length === 0) return 100;
	const kept = envelopes.filter((envelope) => envelopeState(envelope) !== 'over').length;
	return Math.floor((kept * 100) / envelopes.length);
}

function assertProgress({ day, days }: PeriodProgress) {
	if (!Number.isInteger(day) || !Number.isInteger(days) || days < 1 || day < 1 || day > days)
		throw new RangeError(`Invalid period progress: day ${day} of ${days}`);
}
