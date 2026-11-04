import type { Account, Category, CreateTransactionInput } from '@savesphere/contracts';
import { zonedDate, zonedTimeToUtc } from '#lib/dates.ts';
import { parseAmount } from '#lib/money.ts';

export type TransactionFormError =
	'amount' | 'account' | 'category' | 'same_account' | 'amount_received';

/** What the form sends back after a failed submit, so nothing the user typed is lost. */
export interface TransactionFormValues {
	kind: 'expense' | 'income' | 'transfer';
	amount: string;
	amountReceived: string;
	accountId: string;
	toAccountId: string;
	categoryId: string;
	date: string;
	description: string;
	clientRef: string;
}

interface Context {
	accounts: Pick<Account, 'id' | 'currency'>[];
	categories: Pick<Category, 'id' | 'kind'>[];
	locale: string;
	timeZone: string;
	now?: Date;
}

const text = (data: FormData, name: string) => {
	const value = data.get(name);
	return typeof value === 'string' ? value.trim() : '';
};

export function readTransactionForm(data: FormData): TransactionFormValues {
	const kind = text(data, 'kind');
	return {
		kind: kind === 'income' || kind === 'transfer' ? kind : 'expense',
		amount: text(data, 'amount'),
		amountReceived: text(data, 'amountReceived'),
		accountId: text(data, 'accountId'),
		toAccountId: text(data, 'toAccountId'),
		categoryId: text(data, 'categoryId'),
		date: text(data, 'date'),
		description: text(data, 'description'),
		clientRef: text(data, 'clientRef')
	};
}

/**
 * Validates the "Record movement" form and turns it into an API request. Amounts are parsed with
 * the user's locale and the account's currency; dates are calendar days in the user's time zone
 * (today keeps the current time, so the newest movement sorts first).
 */
export function toTransactionInput(
	values: TransactionFormValues,
	{ accounts, categories, locale, timeZone, now = new Date() }: Context
): { input: CreateTransactionInput } | { error: TransactionFormError } {
	const account = accounts.find((candidate) => candidate.id === values.accountId);
	if (!account) return { error: 'account' };
	const amountMinor = parseAmount(values.amount, account.currency, locale);
	if (amountMinor === null) return { error: 'amount' };

	const today = zonedDate(now, timeZone);
	const occurredAt =
		!/^\d{4}-\d{2}-\d{2}$/.test(values.date) || values.date === today
			? now.toISOString()
			: zonedTimeToUtc(values.date, '12:00', timeZone).toISOString();
	const common = {
		occurredAt,
		description: values.description || undefined,
		clientRef: /^[0-9a-f-]{36}$/i.test(values.clientRef) ? values.clientRef : undefined
	};

	if (values.kind === 'transfer') {
		const to = accounts.find((candidate) => candidate.id === values.toAccountId);
		if (!to) return { error: 'account' };
		if (to.id === account.id) return { error: 'same_account' };
		let toAmountMinor: number | undefined;
		if (to.currency !== account.currency) {
			toAmountMinor = parseAmount(values.amountReceived, to.currency, locale) ?? undefined;
			if (toAmountMinor === undefined) return { error: 'amount_received' };
		}
		return {
			input: {
				kind: 'transfer',
				fromAccountId: account.id,
				toAccountId: to.id,
				amountMinor,
				toAmountMinor,
				...common
			}
		};
	}

	const category = categories.find((candidate) => candidate.id === values.categoryId);
	if (!category || category.kind !== values.kind) return { error: 'category' };
	return {
		input: {
			kind: values.kind,
			accountId: account.id,
			categoryId: category.id,
			amountMinor,
			...common
		}
	};
}
