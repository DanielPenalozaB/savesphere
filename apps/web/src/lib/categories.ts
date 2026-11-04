import type { Category } from '@savesphere/contracts';
import type { Component } from 'svelte';
import type { SVGAttributes } from 'svelte/elements';
import IconMore from '~icons/material-symbols/more-horiz';
import IconAdd from '~icons/material-symbols/add-circle-outline';
import IconCar from '~icons/material-symbols/directions-car-outline';
import IconCart from '~icons/material-symbols/shopping-cart-outline';
import IconCategory from '~icons/material-symbols/category-outline';
import IconComputer from '~icons/material-symbols/computer-outline';
import IconEducation from '~icons/material-symbols/school-outline';
import IconGift from '~icons/material-symbols/redeem';
import IconHealth from '~icons/material-symbols/favorite-outline';
import IconHome from '~icons/material-symbols/home-outline';
import IconInvest from '~icons/material-symbols/trending-up';
import IconMovie from '~icons/material-symbols/movie-outline';
import IconRepeat from '~icons/material-symbols/autorenew';
import IconRestaurant from '~icons/material-symbols/restaurant';
import IconShopping from '~icons/material-symbols/shopping-bag-outline';
import IconUtilities from '~icons/material-symbols/bolt-outline';
import IconWork from '~icons/material-symbols/work-outline';
import { m } from '#lib/paraglide/messages.js';

type Icon = Component<SVGAttributes<SVGSVGElement>>;

/** Category icons are stored as Lucide-style names (from the seed); map them to Material Symbols. */
const ICONS: Record<string, Icon> = {
	house: IconHome,
	'shopping-cart': IconCart,
	utensils: IconRestaurant,
	car: IconCar,
	zap: IconUtilities,
	'heart-pulse': IconHealth,
	film: IconMovie,
	'shopping-bag': IconShopping,
	repeat: IconRepeat,
	'graduation-cap': IconEducation,
	'circle-ellipsis': IconMore,
	briefcase: IconWork,
	laptop: IconComputer,
	'trending-up': IconInvest,
	gift: IconGift,
	'circle-plus': IconAdd
};

export function categoryIcon(icon: string | null): Icon {
	return (icon && ICONS[icon]) || IconCategory;
}

/**
 * The starter categories are created in English for every user; show them in the UI language.
 * Categories the user created or renamed keep their own name.
 */
const DEFAULT_NAMES: Record<string, () => string> = {
	Housing: m.category_housing,
	'Food & Groceries': m.category_groceries,
	'Dining Out': m.category_dining_out,
	Transport: m.category_transport,
	Utilities: m.category_utilities,
	Health: m.category_health,
	Entertainment: m.category_entertainment,
	Shopping: m.category_shopping,
	Subscriptions: m.category_subscriptions,
	Education: m.category_education,
	Other: m.category_other,
	Salary: m.category_salary,
	Freelance: m.category_freelance,
	Investments: m.category_investments,
	Gifts: m.category_gifts,
	'Other Income': m.category_other_income
};

export function categoryLabel(category: Pick<Category, 'name'>): string {
	return DEFAULT_NAMES[category.name]?.() ?? category.name;
}

/** Categories in the UI language's alphabetical order, with the catch-all "Other" ones last. */
export function sortCategories<T extends Pick<Category, 'name'>>(
	categories: T[],
	locale: string
): T[] {
	const last = (c: T) => (c.name === 'Other' || c.name === 'Other Income' ? 1 : 0);
	return [...categories].sort(
		(a, b) => last(a) - last(b) || categoryLabel(a).localeCompare(categoryLabel(b), locale)
	);
}
