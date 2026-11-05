import { minorUnitOf, type Account, type AccountKind, type Goal } from '@savesphere/contracts';
import { contributionMonths, monthlyContributionMinor, permille } from '@savesphere/core';

export interface GoalProgress {
	/** Saved share of the target in tenths of a percent, capped at 1000. */
	permille: number;
	reached: boolean;
	/** Monthly contributions left until the target date; null without a date. */
	months: number | null;
	/**
	 * What to set aside per month to arrive on time, rounded up to a whole currency unit; null
	 * without a date or once it has passed.
	 */
	monthlyMinor: number | null;
	/** The target date has passed and the goal isn't reached. */
	overdue: boolean;
}

export function goalProgress(goal: Goal, today: string): GoalProgress {
	const reached = goal.savedMinor >= goal.targetMinor;
	const months = goal.targetDate ? contributionMonths(today, goal.targetDate) : null;
	return {
		permille: Math.min(1000, permille(Math.max(0, goal.savedMinor), goal.targetMinor)),
		reached,
		months,
		monthlyMinor:
			months === null ? null : wholeUnitsUp(monthlyContributionMinor(goal, months), goal.currency),
		overdue: !reached && months === 0
	};
}

/** Rounds up to a whole currency unit ("133.333,34" → "133.334"), so the goal is still reached. */
function wholeUnitsUp(minor: number | null, currency: string): number | null {
	if (minor === null) return null;
	const unit = 10 ** minorUnitOf(currency);
	return Math.ceil(minor / unit) * unit;
}

/** Active first, then paused, achieved and abandoned; each group keeps the API's order. */
export function sortGoals(goals: Goal[]): Goal[] {
	const rank = { active: 0, paused: 1, achieved: 2, abandoned: 3 } as const;
	return [...goals].sort((a, b) => rank[a.status] - rank[b.status]);
}

const LIABILITY_KINDS = new Set<AccountKind>(['credit_card', 'loan']);

export function isLiability(account: Pick<Account, 'kind'>): boolean {
	return LIABILITY_KINDS.has(account.kind);
}

export interface BalanceSheet {
	/** Accounts in `currency` that count toward totals, assets first, largest balances first. */
	accounts: Account[];
	assetsMinor: number;
	/** What is owed, as a positive amount. */
	liabilitiesMinor: number;
	netMinor: number;
}

/**
 * Assets vs liabilities in one currency (never converted). A liability account's balance is what
 * is owed when negative; an overpaid card (positive balance) counts as an asset.
 */
export function balanceSheet(accounts: Account[], currency: string): BalanceSheet {
	const counted = accounts.filter((a) => a.includeInTotals && a.currency === currency);
	let assetsMinor = 0;
	let liabilitiesMinor = 0;
	for (const account of counted) {
		if (account.balanceMinor >= 0) assetsMinor += account.balanceMinor;
		else liabilitiesMinor -= account.balanceMinor;
	}
	return {
		accounts: [...counted].sort(
			(a, b) =>
				Number(isLiability(a)) - Number(isLiability(b)) ||
				Math.abs(b.balanceMinor) - Math.abs(a.balanceMinor)
		),
		assetsMinor,
		liabilitiesMinor,
		netMinor: assetsMinor - liabilitiesMinor
	};
}
