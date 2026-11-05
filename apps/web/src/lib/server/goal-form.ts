import {
	SUPPORTED_CURRENCIES,
	type CreateGoalAllocationInput,
	type CreateGoalInput
} from '@savesphere/contracts';
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

export type AllocationFormError = 'amount';

/** "Add money" / "Take money out": a positive amount and a direction, in the goal's currency. */
export function toAllocationInput(
	data: FormData,
	currency: string,
	locale: string
): { input: CreateGoalAllocationInput } | { error: AllocationFormError } {
	const text = (name: string) => {
		const value = data.get(name);
		return typeof value === 'string' ? value.trim() : '';
	};
	const amount = parseAmount(text('amount'), currency, locale);
	if (amount === null) return { error: 'amount' };
	const note = text('note');
	return {
		input: {
			amountMinor: text('direction') === 'withdraw' ? -amount : amount,
			...(note && { note: note.slice(0, 200) })
		}
	};
}
