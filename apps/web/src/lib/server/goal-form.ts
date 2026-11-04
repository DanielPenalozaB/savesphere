import { SUPPORTED_CURRENCIES, type CreateGoalInput } from '@savesphere/contracts';
import { parseAmount } from '#lib/money.ts';

export type GoalFormError = 'name' | 'amount' | 'date' | 'generic';

export function toGoalInput(
	data: FormData,
	locale: string,
	today: string
): { input: CreateGoalInput } | { error: GoalFormError } {
	const field = (name: string) => {
		const value = data.get(name);
		return typeof value === 'string' ? value.trim() : '';
	};
	const name = field('name');
	if (!name) return { error: 'name' };
	const currency =
		SUPPORTED_CURRENCIES.find((c) => c.code === field('currency'))?.code ??
		SUPPORTED_CURRENCIES[0].code;
	const targetMinor = parseAmount(field('target'), currency, locale);
	if (targetMinor === null) return { error: 'amount' };
	const targetDate = field('targetDate');
	if (targetDate && (!/^\d{4}-\d{2}-\d{2}$/.test(targetDate) || targetDate <= today)) {
		return { error: 'date' };
	}
	return { input: { name, currency, targetMinor, targetDate: targetDate || undefined } };
}
