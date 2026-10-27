import type { Account, Category, Transaction } from '@savesphere/contracts';
import type { Component } from 'svelte';
import type { SVGAttributes } from 'svelte/elements';
import IconAdjust from '~icons/material-symbols/tune';
import IconTransfer from '~icons/material-symbols/swap-horiz';
import { categoryIcon, categoryLabel } from '#lib/categories.ts';
import { m } from '#lib/paraglide/messages.js';

export interface TransactionView {
	id: string;
	title: string;
	categoryName: string | null;
	accountName: string;
	/** Signed from the user's point of view: income +, expense −, transfers unsigned. */
	amountMinor: number;
	currency: string;
	tone: 'income' | 'expense' | 'neutral';
	icon: Component<SVGAttributes<SVGSVGElement>>;
	occurredAt: string;
}

/** Turns a ledger transaction (header + entries) into what a list row shows. */
export function describeTransaction(
	tx: Transaction,
	accounts: Pick<Account, 'id' | 'name' | 'currency'>[],
	categories: Pick<Category, 'id' | 'name' | 'icon'>[]
): TransactionView {
	const accountOf = (id: string | undefined) => accounts.find((account) => account.id === id);
	const category = categories.find((candidate) => candidate.id === tx.categoryId);
	// Entries are sorted ascending, so a transfer's first entry is the outgoing side.
	const [first, second] = tx.entries;
	const account = accountOf(first?.accountId);
	const base = {
		id: tx.id,
		accountName: account?.name ?? '—',
		currency: account?.currency ?? 'USD',
		occurredAt: tx.occurredAt
	};

	if (tx.kind === 'transfer') {
		const to = accountOf(second?.accountId);
		return {
			...base,
			title: tx.description || m.tx_transfer_label({ account: to?.name ?? '—' }),
			categoryName: m.kind_transfer(),
			amountMinor: Math.abs(first?.amountMinor ?? 0),
			tone: 'neutral',
			icon: IconTransfer
		};
	}

	const amountMinor = first?.amountMinor ?? 0;
	if (tx.kind === 'adjustment') {
		return {
			...base,
			// The API names opening balances in English; show them in the UI language.
			title:
				!tx.description || tx.description === 'Opening balance'
					? m.tx_opening_balance()
					: tx.description,
			categoryName: m.kind_adjustment(),
			amountMinor,
			tone: amountMinor >= 0 ? 'income' : 'expense',
			icon: IconAdjust
		};
	}

	const categoryName = category ? categoryLabel(category) : null;
	return {
		...base,
		title: tx.description || categoryName || m.tx_untitled(),
		categoryName,
		amountMinor,
		tone: tx.kind === 'income' ? 'income' : 'expense',
		icon: categoryIcon(category?.icon ?? null)
	};
}
