import type { Database } from './client.js';
import { aiProviders, currencies } from './schema/index.js';

export const CURRENCIES = [
	{ code: 'USD', name: 'US Dollar', minorUnit: 2 },
	{ code: 'EUR', name: 'Euro', minorUnit: 2 },
	{ code: 'GBP', name: 'Pound Sterling', minorUnit: 2 },
	{ code: 'CAD', name: 'Canadian Dollar', minorUnit: 2 },
	{ code: 'MXN', name: 'Mexican Peso', minorUnit: 2 },
	{ code: 'COP', name: 'Colombian Peso', minorUnit: 2 },
	{ code: 'ARS', name: 'Argentine Peso', minorUnit: 2 },
	{ code: 'CLP', name: 'Chilean Peso', minorUnit: 0 },
	{ code: 'PEN', name: 'Peruvian Sol', minorUnit: 2 },
	{ code: 'BRL', name: 'Brazilian Real', minorUnit: 2 },
	{ code: 'JPY', name: 'Yen', minorUnit: 0 }
] as const;

export const AI_PROVIDERS = [
	{ code: 'anthropic', name: 'Anthropic' },
	{ code: 'openai', name: 'OpenAI' },
	{ code: 'google', name: 'Google' },
	{ code: 'openai_compatible', name: 'OpenAI-compatible (Ollama, LM Studio, ...)' }
] as const;

export const DEFAULT_CATEGORIES = {
	expense: [
		{ name: 'Housing', icon: 'house' },
		{ name: 'Food & Groceries', icon: 'shopping-cart' },
		{ name: 'Dining Out', icon: 'utensils' },
		{ name: 'Transport', icon: 'car' },
		{ name: 'Utilities', icon: 'zap' },
		{ name: 'Health', icon: 'heart-pulse' },
		{ name: 'Entertainment', icon: 'film' },
		{ name: 'Shopping', icon: 'shopping-bag' },
		{ name: 'Subscriptions', icon: 'repeat' },
		{ name: 'Education', icon: 'graduation-cap' },
		{ name: 'Other', icon: 'circle-ellipsis' }
	],
	income: [
		{ name: 'Salary', icon: 'briefcase' },
		{ name: 'Freelance', icon: 'laptop' },
		{ name: 'Investments', icon: 'trending-up' },
		{ name: 'Gifts', icon: 'gift' },
		{ name: 'Other Income', icon: 'circle-plus' }
	]
} as const;

/** Idempotent: safe to run on every deploy. */
export async function seedReferenceData(db: Database): Promise<void> {
	await db
		.insert(currencies)
		.values([...CURRENCIES])
		.onConflictDoNothing();
	await db
		.insert(aiProviders)
		.values([...AI_PROVIDERS])
		.onConflictDoNothing();
}
