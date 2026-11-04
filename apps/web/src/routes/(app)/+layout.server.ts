import type { Account, Category, Goal, UserSettings } from '@savesphere/contracts';
import { redirect } from '@sveltejs/kit';
import { formatLocale } from '#lib/locale.ts';
import { getLocale } from '#lib/paraglide/runtime.js';
import { serverApi } from '#lib/server/api.ts';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
	const { locals } = event;
	if (!locals.user) redirect(303, '/login');

	// Shared by every page and the "Record movement" sheet. Refreshed with invalidateAll().
	const api = serverApi(event);
	const [settings, accounts, categories, goals] = await Promise.all([
		api.get<UserSettings>('/me/settings'),
		api.get<Account[]>('/accounts'),
		api.get<Category[]>('/categories'),
		api.get<Goal[]>('/goals')
	]);

	return {
		user: locals.user,
		settings,
		accounts: accounts.filter((account) => !account.archivedAt),
		categories: categories.filter((category) => !category.archivedAt),
		/** Active savings goals, shown as the sidebar's "vaults". */
		goals: goals.filter((goal) => goal.status === 'active'),
		sidebarCollapsed: event.cookies.get('sidebar') === 'collapsed',
		/** Locale for numbers and dates, e.g. "es-CO". */
		locale: formatLocale(getLocale(), settings.locale)
	};
};
