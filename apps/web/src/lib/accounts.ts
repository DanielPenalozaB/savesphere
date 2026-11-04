import type { AccountKind } from '@savesphere/contracts';
import type { Component } from 'svelte';
import type { SVGAttributes } from 'svelte/elements';
import IconBank from '~icons/material-symbols/account-balance-outline';
import IconCard from '~icons/material-symbols/credit-card-outline';
import IconCash from '~icons/material-symbols/payments-outline';
import IconInvest from '~icons/material-symbols/show-chart';
import IconSavings from '~icons/material-symbols/savings-outline';
import IconWallet from '~icons/material-symbols/account-balance-wallet-outline';
import { m } from '#lib/paraglide/messages.js';

export const accountKindLabels: Record<AccountKind, () => string> = {
	cash: m.account_kind_cash,
	checking: m.account_kind_checking,
	savings: m.account_kind_savings,
	credit_card: m.account_kind_credit_card,
	investment: m.account_kind_investment,
	loan: m.account_kind_loan,
	other: m.account_kind_other
};

export const accountKindIcons: Record<AccountKind, Component<SVGAttributes<SVGSVGElement>>> = {
	cash: IconCash,
	checking: IconBank,
	savings: IconSavings,
	credit_card: IconCard,
	investment: IconInvest,
	loan: IconBank,
	other: IconWallet
};
