import type { Account, UserSettings } from '@savesphere/contracts';
import { fail, redirect } from '@sveltejs/kit';
import { ApiError } from '#lib/api/client.ts';
import { formatLocale } from '#lib/locale.ts';
import { getLocale } from '#lib/paraglide/runtime.js';
import { serverApi } from '#lib/server/api.ts';
import { toAccountInput } from '#lib/server/account-form.ts';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async (event) => {
		const api = serverApi(event);
		const [settings, accounts] = await Promise.all([
			api.get<UserSettings>('/me/settings'),
			api.get<Account[]>('/accounts')
		]);
		const result = toAccountInput(
			await event.request.formData(),
			formatLocale(getLocale(), settings.locale)
		);
		if ('error' in result) return fail(400, { error: result.error });

		try {
			await api.post('/accounts', result.input);
			// The first account sets the currency the dashboard reports in.
			if (accounts.length === 0 && settings.baseCurrency !== result.input.currency) {
				await api.patch('/me/settings', { baseCurrency: result.input.currency });
			}
		} catch (error) {
			const duplicate = error instanceof ApiError && error.code === 'CONFLICT';
			return fail(duplicate ? 409 : 500, { error: duplicate ? 'duplicate' : 'generic' } as const);
		}
		redirect(303, '/');
	}
};
