<script lang="ts">
	import type { Account } from '@savesphere/contracts';
	import IconAdd from '~icons/material-symbols/add';
	import { resolve } from '$app/paths';
	import { accountKindIcons, accountKindLabels } from '#lib/accounts.ts';
	import { formatMoney } from '#lib/money.ts';
	import { m } from '#lib/paraglide/messages.js';

	let { accounts, locale }: { accounts: Account[]; locale: string } = $props();
</script>

<section class="flex flex-col card">
	<header class="mb-4">
		<h2 class="text-headline-md">{m.home_accounts()}</h2>
		<p class="text-body-sm text-on-surface-variant">{m.home_accounts_intro()}</p>
	</header>
	<ul class="flex-1 space-y-2">
		{#each accounts as account (account.id)}
			{@const Icon = accountKindIcons[account.kind]}
			<li class="flex items-center gap-3 rounded-2xl bg-surface-container-low px-4 py-3">
				<span
					class="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-container-lowest text-on-surface-variant"
				>
					<Icon class="size-5" aria-hidden="true" />
				</span>
				<!-- Balance on its own line, so long names never squeeze or split the amount. -->
				<div class="min-w-0 flex-1">
					<p class="truncate text-label-lg" title={account.name}>{account.name}</p>
					<div class="flex flex-wrap items-baseline justify-between gap-x-2">
						<span class="text-body-sm text-on-surface-variant"
							>{accountKindLabels[account.kind]()}</span
						>
						<span
							class={[
								'font-display text-title-sm whitespace-nowrap tabular-nums',
								account.balanceMinor < 0 ? 'text-error' : 'text-on-surface'
							]}
						>
							{formatMoney(account.balanceMinor, account.currency, locale)}
						</span>
					</div>
				</div>
			</li>
		{/each}
	</ul>
	<a
		href={resolve('accounts/new')}
		class="mt-4 inline-flex items-center gap-1 self-start rounded-full px-3 py-1.5 text-label-lg text-primary hover:bg-primary-fixed"
	>
		<IconAdd class="size-5" aria-hidden="true" />
		{m.home_add_account()}
	</a>
</section>
