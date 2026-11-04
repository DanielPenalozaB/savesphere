import type { TransactionSummary } from '@savesphere/contracts';

/** The summary row for `currency`, or zeros when nothing was recorded in it. */
export function totalsIn(summary: TransactionSummary, currency: string) {
	return (
		summary.totals.find((row) => row.currency === currency) ?? {
			currency,
			incomeMinor: 0,
			expenseMinor: 0,
			count: 0,
			incomeCount: 0,
			expenseCount: 0
		}
	);
}

/** "octubre de 2026" for a year/month, independent of the time zone. */
export function monthLabel(year: number, month: number, locale: string): string {
	return new Intl.DateTimeFormat(locale, {
		month: 'long',
		year: 'numeric',
		timeZone: 'UTC'
	}).format(new Date(Date.UTC(year, month - 1, 15)));
}
