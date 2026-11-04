import type { UserSettings } from '@savesphere/contracts';
import { fail, redirect } from '@sveltejs/kit';
import { zonedDate } from '#lib/dates.ts';
import { formatLocale } from '#lib/locale.ts';
import { getLocale } from '#lib/paraglide/runtime.js';
import { serverApi } from '#lib/server/api.ts';
import { toGoalInput } from '#lib/server/goal-form.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const { settings } = await parent();
	return { today: zonedDate(new Date(), settings.timezone) };
};

export const actions: Actions = {
	default: async (event) => {
		const api = serverApi(event);
		const settings = await api.get<UserSettings>('/me/settings');
		const result = toGoalInput(
			await event.request.formData(),
			formatLocale(getLocale(), settings.locale),
			zonedDate(new Date(), settings.timezone)
		);
		if ('error' in result) return fail(400, { error: result.error });
		try {
			await api.post('/goals', result.input);
		} catch {
			return fail(500, { error: 'generic' as const });
		}
		redirect(303, '/');
	}
};
