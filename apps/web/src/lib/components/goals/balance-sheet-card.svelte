<script lang="ts">
	import { permille } from '@savesphere/core';
	import { accountKindIcons, accountKindLabels } from '#lib/accounts.ts';
	import { isLiability, type BalanceSheet } from '#lib/goals.ts';
	import { formatMoney } from '#lib/money.ts';
	import { m } from '#lib/paraglide/messages.js';

	/** The design's "Asignación del Balance General": assets vs debts, one currency. */
	let { sheet, currency, locale }: { sheet: BalanceSheet; currency: string; locale: string } =
		$props();

	const money = (minor: number) => formatMoney(minor, currency, locale);
	const assetsShare = $derived(
		permille(sheet.assetsMinor, sheet.assetsMinor + sheet.liabilitiesMinor) / 10
	);
</script>

<section class="card" aria-labelledby="balance-sheet-title">
	<h2 id="balance-sheet-title" class="text-title-lg">{m.balance_title()}</h2>
	<p class="text-body-sm text-on-surface-variant">{m.balance_intro({ currency })}</p>
	{#if sheet.accounts.length === 0}
		<p class="mt-4 text-body-md text-on-surface-variant">{m.balance_empty({ currency })}</p>
	{:else}
		<div class="mt-4 flex flex-wrap justify-between gap-x-4 text-label-md tabular-nums">
			<span>{m.balance_assets({ amount: money(sheet.assetsMinor) })}</span>
			<span class="text-error"
				>{m.balance_liabilities({ amount: money(sheet.liabilitiesMinor) })}</span
			>
		</div>
		<div class="mt-2 flex h-3 overflow-hidden rounded-full bg-error-container" aria-hidden="true">
			<div class="h-full rounded-full bg-primary-container" style:width="{assetsShare}%"></div>
		</div>
		<ul class="mt-4 space-y-2">
			{#each sheet.accounts as account (account.id)}
				{@const Icon = accountKindIcons[account.kind]}
				{@const owed = isLiability(account) && account.balanceMinor < 0}
				<li
					class={[
						'flex items-center justify-between gap-3 rounded-2xl px-3 py-2.5',
						owed ? 'bg-error-container/40' : 'bg-surface-container-low'
					]}
				>
					<span class="flex min-w-0 items-center gap-3">
						<span
							class="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-container-lowest text-primary"
						>
							<Icon class="size-5" aria-hidden="true" />
						</span>
						<span class="min-w-0">
							<span class="block truncate text-label-lg">{account.name}</span>
							<span class="block text-body-sm text-on-surface-variant"
								>{accountKindLabels[account.kind]()}</span
							>
						</span>
					</span>
					<span class={['shrink-0 text-label-lg tabular-nums', owed && 'text-error']}
						>{money(account.balanceMinor)}</span
					>
				</li>
			{/each}
		</ul>
	{/if}
</section>
