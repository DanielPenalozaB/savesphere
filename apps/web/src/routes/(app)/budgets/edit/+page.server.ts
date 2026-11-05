import {
	SUPPORTED_CURRENCIES,
	type Budget,
	type Category,
	type UserSettings
} from '@savesphere/contracts';
import { fail, redirect } from '@sveltejs/kit';
import { limitsFromForm, type BudgetFormError } from '#lib/budgets.ts';
import { zonedDate } from '#lib/dates.ts';
import { formatLocale } from '#lib/locale.ts';
import { parseAmount } from '#lib/money.ts';
import { getLocale } from '#lib/paraglide/runtime.js';
import { serverApi } from '#lib/server/api.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const [budget] = await serverApi(event).get<Budget[]>('/budgets');
	return { budget: budget ?? null };
};

export const actions: Actions = {
	default: async (event) => {
		const api = serverApi(event);
		const [settings, categories, [budget]] = await Promise.all([
			api.get<UserSettings>('/me/settings'),
			api.get<Category[]>('/categories'),
			api.get<Budget[]>('/budgets')
		]);
		const data = await event.request.formData();
		const name = String(data.get('name') ?? '').trim();
		if (!name) return fail(400, { error: 'name' } satisfies BudgetFormError);

		// A budget's currency is fixed once created; its envelopes only count that currency.
		const currency =
			budget?.currency ??
			SUPPORTED_CURRENCIES.find((c) => c.code === data.get('currency'))?.code ??
			settings.baseCurrency;
		const locale = formatLocale(getLocale(), settings.locale);
		const expense = categories.filter((c) => c.kind === 'expense' && !c.archivedAt);
		const result = limitsFromForm(data, expense, (text) => parseAmount(text, currency, locale));
		if ('error' in result) return fail(400, result satisfies BudgetFormError);

		try {
			if (budget) {
				await api.put(`/budgets/${budget.id}`, { name, limits: result.limits });
			} else {
				const today = zonedDate(new Date(), settings.timezone);
				await api.post('/budgets', {
					name,
					currency,
					startsOn: `${today.slice(0, 7)}-01`,
					limits: result.limits
				});
			}
		} catch {
			return fail(500, { error: 'generic' } satisfies BudgetFormError);
		}
		redirect(303, '/budgets');
	}
};
