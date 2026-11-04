import type { Transaction } from '@savesphere/contracts';
import { zonedDate } from '#lib/dates.ts';

/** Percent change from `previous` to `current`, rounded; null when there is nothing to compare. */
export function percentChange(current: number, previous: number): number | null {
	if (previous === 0) return null;
	return Math.round(((current - previous) / Math.abs(previous)) * 1000) / 10;
}

/** Day of week (0 = Sunday) of a calendar date "YYYY-MM-DD". */
function weekdayOf(date: string): number {
	return new Date(`${date}T12:00:00Z`).getUTCDay();
}

export interface WeekdayBucket {
	weekday: number;
	/** Narrow label in the UI locale, e.g. "L" (es) or "M" (en). */
	label: string;
	expenseMinor: number;
	/** 0–3, relative to the busiest weekday: the design's dot column height. */
	level: number;
}

/**
 * Spending per weekday ("Ritmo de egresos por día"), ordered from the user's first day of the
 * week. Only expenses count; amounts are compared within one currency.
 */
export function weekdayRhythm(
	transactions: Pick<Transaction, 'kind' | 'occurredAt' | 'entries'>[],
	{ timeZone, locale, weekStartsOn }: { timeZone: string; locale: string; weekStartsOn: number }
): WeekdayBucket[] {
	const totals = Array.from({ length: 7 }, () => 0);
	for (const tx of transactions) {
		if (tx.kind !== 'expense') continue;
		const day = weekdayOf(zonedDate(new Date(tx.occurredAt), timeZone));
		totals[day]! += Math.abs(tx.entries[0]?.amountMinor ?? 0);
	}
	const max = Math.max(...totals);
	// 2026-10-04 is a Sunday: day d of the week is that date + d.
	const label = new Intl.DateTimeFormat(locale, { weekday: 'narrow', timeZone: 'UTC' });
	return Array.from({ length: 7 }, (_, index) => {
		const weekday = (weekStartsOn + index) % 7;
		const total = totals[weekday]!;
		return {
			weekday,
			label: label.format(new Date(Date.UTC(2026, 9, 4 + weekday, 12))),
			expenseMinor: total,
			level: total === 0 || max === 0 ? 0 : Math.max(1, Math.ceil((total / max) * 3))
		};
	});
}

/** Which week of the month `date` falls in, and how many weeks the month spans ("Semana 3 de 5"). */
export function weekOfMonth(date: string, weekStartsOn: number): { week: number; weeks: number } {
	const [year, month, day] = date.split('-').map(Number) as [number, number, number];
	const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
	const offset = (firstWeekday - weekStartsOn + 7) % 7;
	const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
	return {
		week: Math.floor((day - 1 + offset) / 7) + 1,
		weeks: Math.ceil((daysInMonth + offset) / 7)
	};
}

export interface DayGroup<T> {
	date: string;
	items: T[];
}

/** Groups items (newest first) by their calendar day in `timeZone`, keeping the order. */
export function groupByDay<T extends { occurredAt: string }>(
	items: T[],
	timeZone: string
): DayGroup<T>[] {
	const groups: DayGroup<T>[] = [];
	for (const item of items) {
		const date = zonedDate(new Date(item.occurredAt), timeZone);
		const last = groups.at(-1);
		if (last?.date === date) last.items.push(item);
		else groups.push({ date, items: [item] });
	}
	return groups;
}

/** The category with the largest share of `expenses` (one currency), or null. */
export function topExpenseCategory(
	expenses: Pick<Transaction, 'categoryId' | 'entries'>[]
): { categoryId: string; amountMinor: number } | null {
	const totals: Record<string, number> = {};
	for (const tx of expenses) {
		if (!tx.categoryId) continue;
		totals[tx.categoryId] =
			(totals[tx.categoryId] ?? 0) + Math.abs(tx.entries[0]?.amountMinor ?? 0);
	}
	const [categoryId, amountMinor] = Object.entries(totals).sort((a, b) => b[1] - a[1])[0] ?? [];
	return categoryId && amountMinor ? { categoryId, amountMinor } : null;
}
