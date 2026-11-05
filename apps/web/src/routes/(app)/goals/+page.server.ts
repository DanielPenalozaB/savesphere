import type { Goal } from '@savesphere/contracts';
import { zonedDate } from '#lib/dates.ts';
import { serverApi } from '#lib/server/api.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const { settings } = await event.parent();
	// The layout only keeps active goals (for the sidebar); this page lists every status.
	const allGoals = await serverApi(event).get<Goal[]>('/goals');
	return { allGoals, today: zonedDate(new Date(), settings.timezone) };
};
