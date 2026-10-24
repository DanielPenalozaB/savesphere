import type { Path } from '$app/types';
import type { Component } from 'svelte';
import type { SVGAttributes } from 'svelte/elements';
import IconActivity from '~icons/material-symbols/receipt-long-outline';
import IconBudgets from '~icons/material-symbols/account-balance-wallet-outline';
import IconGoals from '~icons/material-symbols/savings-outline';
import IconHome from '~icons/material-symbols/dashboard-outline';
import IconInsights from '~icons/material-symbols/insights';
import IconPlanning from '~icons/material-symbols/calendar-month-outline';
import IconSettings from '~icons/material-symbols/settings-outline';
import IconSubscriptions from '~icons/material-symbols/autorenew';
import { m } from '#lib/paraglide/messages.js';

export interface NavItem {
	/** Base-relative path, as SvelteKit 3's `resolve()` expects (`''` is home). */
	href: Path;
	label: () => string;
	/** Shorter label for the mobile bottom bar, when `label` doesn't fit. */
	shortLabel?: () => string;
	icon: Component<SVGAttributes<SVGSVGElement>>;
}

/** Sidebar order, matching the Stitch design. */
export const mainNav: NavItem[] = [
	{ href: '', label: m.nav_home, icon: IconHome },
	{ href: 'budgets', label: m.nav_budgets, icon: IconBudgets },
	{ href: 'planning', label: m.nav_planning, icon: IconPlanning },
	{ href: 'subscriptions', label: m.nav_subscriptions, icon: IconSubscriptions },
	{ href: 'goals', label: m.nav_goals, shortLabel: m.nav_goals_short, icon: IconGoals },
	{ href: 'insights', label: m.nav_insights, icon: IconInsights },
	{ href: 'activity', label: m.nav_activity, icon: IconActivity }
];

export const settingsNav: NavItem = {
	href: 'settings',
	label: m.nav_settings,
	icon: IconSettings
};

/** Mobile bottom bar: the most frequent destinations; the rest live in the "More" drawer. */
export const bottomNav: NavItem[] = (['', 'activity', 'budgets', 'goals'] as const).map((href) =>
	navItem(href)
);

/** Whether `pathname` (from `page.url.pathname`) is inside the section at `href`. */
export function isActive(href: Path, pathname: string): boolean {
	const section = `/${href}`;
	return href === ''
		? pathname === '/'
		: pathname === section || pathname.startsWith(`${section}/`);
}

export function navItem(href: Path): NavItem {
	const item = [...mainNav, settingsNav].find((candidate) => candidate.href === href);
	if (!item) throw new Error(`Unknown nav item: ${href}`);
	return item;
}
