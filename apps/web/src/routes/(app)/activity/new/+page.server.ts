import { randomUUID } from 'node:crypto';
import type { Account, Category, UserSettings } from '@savesphere/contracts';
import { fail, redirect } from '@sveltejs/kit';
import { zonedDate } from '#lib/dates.ts';
import { formatLocale } from '#lib/locale.ts';
import { getLocale } from '#lib/paraglide/runtime.js';
import { serverApi } from '#lib/server/api.ts';
import { readTransactionForm, toTransactionInput } from '#lib/server/transaction-form.ts';
import type { Actions, PageServerLoad } from './$types';

/** Full-page version of the "Record movement" sheet (used before hydration and by direct links). */
export const load: PageServerLoad = async ({ parent }) => {
	const { settings } = await parent();
	return { clientRef: randomUUID(), today: zonedDate(new Date(), settings.timezone) };
};

export const actions: Actions = {
	default: async (event) => {
		const api = serverApi(event);
		const values = readTransactionForm(await event.request.formData());
		const [settings, accounts, categories] = await Promise.all([
			api.get<UserSettings>('/me/settings'),
			api.get<Account[]>('/accounts'),
			api.get<Category[]>('/categories')
		]);

		const result = toTransactionInput(values, {
			accounts,
			categories,
			locale: formatLocale(getLocale(), settings.locale),
			timeZone: settings.timezone
		});
		if ('error' in result) return fail(400, { values, error: result.error });

		try {
			await api.post('/transactions', result.input);
		} catch {
			return fail(500, { values, error: 'generic' as const });
		}
		redirect(303, '/activity');
	}
};
