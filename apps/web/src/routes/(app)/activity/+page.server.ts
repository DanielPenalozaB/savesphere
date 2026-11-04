import {
	transactionKind,
	type TransactionPage,
	type TransactionSummary
} from '@savesphere/contracts';
import { fail } from '@sveltejs/kit';
import { monthRange, parseMonth, shiftMonth, zonedYearMonth } from '#lib/dates.ts';
import { serverApi } from '#lib/server/api.ts';
import type { Actions, PageServerLoad } from './$types';

const PAGE_SIZE = 25;

export const load: PageServerLoad = async (event) => {
	const { url, parent } = event;
	const { settings, accounts } = await parent();
	const current = zonedYearMonth(new Date(), settings.timezone);
	const month = parseMonth(url.searchParams.get('month')) ?? current;
	const range = monthRange(month.year, month.month, settings.timezone);
	const kind = transactionKind.safeParse(url.searchParams.get('kind')).data ?? null;
	const accountId = accounts.find((a) => a.id === url.searchParams.get('account'))?.id ?? null;
	const cursor = url.searchParams.get('cursor');

	const query = new URLSearchParams({
		from: range.from,
		// The list filter is inclusive; stop just before the next month starts.
		to: new Date(Date.parse(range.to) - 1).toISOString(),
		limit: String(PAGE_SIZE)
	});
	if (kind) query.set('kind', kind);
	if (accountId) query.set('accountId', accountId);
	if (cursor) query.set('cursor', cursor);

	const api = serverApi(event);
	const before = shiftMonth(month, -1);
	const [page, summary, previous] = await Promise.all([
		api.get<TransactionPage>(`/transactions?${query}`),
		api.get<TransactionSummary>(`/transactions/summary?${new URLSearchParams(range)}`),
		api.get<TransactionSummary>(
			`/transactions/summary?${new URLSearchParams(monthRange(before.year, before.month, settings.timezone))}`
		)
	]);

	return {
		month,
		isCurrentMonth: month.year === current.year && month.month === current.month,
		filters: { kind, accountId },
		isFirstPage: !cursor,
		page,
		summary,
		previous
	};
};

export const actions: Actions = {
	delete: async (event) => {
		const id = (await event.request.formData()).get('id');
		if (typeof id !== 'string') return fail(400);
		try {
			await serverApi(event).delete(`/transactions/${id}`);
		} catch {
			return fail(404);
		}
	}
};
