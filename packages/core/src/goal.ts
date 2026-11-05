/** Savings-goal maths on integer minor units and calendar dates ("YYYY-MM-DD"). */

const DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

function monthIndex(date: string): number {
	const match = DATE.exec(date);
	if (!match) throw new RangeError(`Invalid date: ${date}`);
	return Number(match[1]) * 12 + Number(match[2]) - 1;
}

/**
 * Monthly contributions left until `target`, counting the current month: from 2026-11-05 to
 * 2027-03-31 that is Nov, Dec, Jan, Feb and Mar (5). 0 once the target date has passed.
 */
export function contributionMonths(today: string, target: string): number {
	if (target < today) return 0;
	return monthIndex(target) - monthIndex(today) + 1;
}

/**
 * What to set aside each month to reach the target in `months` contributions, rounded up to a
 * whole minor unit. 0 when the goal is already reached; null when no months are left.
 */
export function monthlyContributionMinor(
	{ targetMinor, savedMinor }: { targetMinor: number; savedMinor: number },
	months: number
): number | null {
	const remaining = BigInt(targetMinor) - BigInt(savedMinor);
	if (remaining <= 0n) return 0;
	if (months <= 0) return null;
	const perMonth = BigInt(months);
	return Number((remaining + perMonth - 1n) / perMonth);
}
