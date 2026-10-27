import { accountKind, SUPPORTED_CURRENCIES, type CreateAccountInput } from '@savesphere/contracts';
import { parseAmount } from '#lib/money.ts';

export type AccountFormError = 'name' | 'amount' | 'duplicate' | 'generic';

export function toAccountInput(
	data: FormData,
	locale: string
): { input: CreateAccountInput } | { error: AccountFormError } {
	const field = (name: string) => {
		const value = data.get(name);
		return typeof value === 'string' ? value.trim() : '';
	};
	const name = field('name');
	if (!name) return { error: 'name' };
	const kind = accountKind.safeParse(field('kind')).data ?? 'other';
	const currency =
		SUPPORTED_CURRENCIES.find((c) => c.code === field('currency'))?.code ??
		SUPPORTED_CURRENCIES[0].code;

	const opening = field('opening');
	let openingBalanceMinor: number | undefined;
	if (opening && !/^0+([.,]0+)?$/.test(opening)) {
		const parsed = parseAmount(opening, currency, locale);
		if (parsed === null) return { error: 'amount' };
		// Credit cards and loans start owing money.
		openingBalanceMinor = kind === 'credit_card' || kind === 'loan' ? -parsed : parsed;
	}
	return {
		input: { name, kind, currency, includeInTotals: true, openingBalanceMinor }
	};
}
