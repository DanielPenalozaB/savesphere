import type { Goal, GoalStatus, UserSettings } from '@savesphere/contracts';
import { error, fail } from '@sveltejs/kit';
import { ApiError } from '#lib/api/client.ts';
import { zonedDate } from '#lib/dates.ts';
import { formatLocale } from '#lib/locale.ts';
import { getLocale } from '#lib/paraglide/runtime.js';
import { serverApi } from '#lib/server/api.ts';
import { toAllocationInput, toGoalInput } from '#lib/server/goal-form.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const { settings } = await event.parent();
	try {
		const goal = await serverApi(event).get<Goal>(`/goals/${event.params.id}`);
		return { goal, today: zonedDate(new Date(), settings.timezone) };
	} catch (cause) {
		// Unknown ids and other users' goals both look like "not found".
		if (cause instanceof ApiError && (cause.status === 404 || cause.status === 400)) error(404);
		throw cause;
	}
};

const STATUSES: GoalStatus[] = ['active', 'paused', 'achieved', 'abandoned'];

export const actions: Actions = {
	money: async (event) => {
		const api = serverApi(event);
		const [settings, goal] = await Promise.all([
			api.get<UserSettings>('/me/settings'),
			api.get<Goal>(`/goals/${event.params.id}`)
		]);
		const result = toAllocationInput(
			await event.request.formData(),
			goal.currency,
			formatLocale(getLocale(), settings.locale)
		);
		if ('error' in result) return fail(400, { action: 'money' as const, error: result.error });
		try {
			await api.post(`/goals/${goal.id}/allocations`, {
				...result.input,
				allocatedOn: zonedDate(new Date(), settings.timezone)
			});
		} catch (cause) {
			if (cause instanceof ApiError && cause.code === 'VALIDATION_FAILED')
				return fail(400, { action: 'money' as const, error: 'withdraw' as const });
			if (cause instanceof ApiError && cause.code === 'CONFLICT')
				return fail(409, { action: 'money' as const, error: 'abandoned' as const });
			return fail(500, { action: 'money' as const, error: 'generic' as const });
		}
		return { action: 'money' as const, saved: true };
	},

	update: async (event) => {
		const api = serverApi(event);
		const [settings, goal] = await Promise.all([
			api.get<UserSettings>('/me/settings'),
			api.get<Goal>(`/goals/${event.params.id}`)
		]);
		const data = await event.request.formData();
		// The currency is fixed once created.
		data.set('currency', goal.currency);
		const result = toGoalInput(
			data,
			formatLocale(getLocale(), settings.locale),
			zonedDate(new Date(), settings.timezone)
		);
		if ('error' in result) return fail(400, { action: 'update' as const, error: result.error });
		try {
			await api.patch(`/goals/${goal.id}`, {
				name: result.input.name,
				targetMinor: result.input.targetMinor,
				targetDate: result.input.targetDate ?? null
			});
		} catch {
			return fail(500, { action: 'update' as const, error: 'generic' as const });
		}
		return { action: 'update' as const, saved: true };
	},

	status: async (event) => {
		const status = (await event.request.formData()).get('status');
		if (!STATUSES.includes(status as GoalStatus)) return fail(400, { action: 'status' as const });
		await serverApi(event).patch(`/goals/${event.params.id}`, { status });
		return { action: 'status' as const, saved: true };
	}
};
