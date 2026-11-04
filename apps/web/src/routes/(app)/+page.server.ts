import type { TransactionPage, TransactionSummary } from '@savesphere/contracts';
import { monthRange, shiftMonth, zonedDate, zonedYearMonth } from '#lib/dates.ts';
import { serverApi } from '#lib/server/api.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const { settings, accounts } = await event.parent();
	if (accounts.length === 0)
		return {
			month: null,
			today: null,
			summary: null,
			previous: null,
			monthExpenses: [],
			recent: []
		};

	const tz = settings.timezone;
	const month = zonedYearMonth(new Date(), tz);
	const range = monthRange(month.year, month.month, tz);
	const previousMonth = shiftMonth(month, -1);
	const api = serverApi(event);
	const expensesQuery = new URLSearchParams({
		kind: 'expense',
		from: range.from,
		to: new Date(Date.parse(range.to) - 1).toISOString(),
		// The weekday rhythm and top category are estimates from the latest 100 expenses.
		limit: '100'
	});
	const [summary, previous, monthExpenses, recent] = await Promise.all([
		api.get<TransactionSummary>(`/transactions/summary?${new URLSearchParams(range)}`),
		api.get<TransactionSummary>(
			`/transactions/summary?${new URLSearchParams(monthRange(previousMonth.year, previousMonth.month, tz))}`
		),
		api.get<TransactionPage>(`/transactions?${expensesQuery}`),
		api.get<TransactionPage>('/transactions?limit=5')
	]);
	return {
		month,
		today: zonedDate(new Date(), tz),
		summary,
		previous,
		monthExpenses: monthExpenses.items,
		recent: recent.items
	};
};
