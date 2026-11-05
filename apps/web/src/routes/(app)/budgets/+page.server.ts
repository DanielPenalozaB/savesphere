import type { Budget, BudgetSpending } from '@savesphere/contracts';
import { monthRange, zonedDate, zonedYearMonth } from '#lib/dates.ts';
import { serverApi } from '#lib/server/api.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const { settings } = await event.parent();
	const api = serverApi(event);
	// One monthly budget per user for now; the API already supports several.
	const [budget] = await api.get<Budget[]>('/budgets');
	if (!budget) return { budget: null, spending: null, today: null };

	const tz = settings.timezone;
	const month = zonedYearMonth(new Date(), tz);
	const range = monthRange(month.year, month.month, tz);
	const spending = await api.get<BudgetSpending>(
		`/budgets/${budget.id}/spending?${new URLSearchParams(range)}`
	);
	return { budget, spending, today: zonedDate(new Date(), tz) };
};
