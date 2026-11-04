<script lang="ts">
	import IconDelete from '~icons/material-symbols/delete-outline';
	import IconMore from '~icons/material-symbols/more-vert';
	import { flip } from 'svelte/animate';
	import { fade, fly } from 'svelte/transition';
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { zonedDate } from '#lib/dates.ts';
	import { groupByDay } from '#lib/insights.ts';
	import { formatMoney } from '#lib/money.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { toast } from '#lib/toast.svelte.ts';
	import type { TransactionView } from '#lib/transactions.ts';

	interface Props {
		transactions: TransactionView[];
		locale: string;
		timeZone: string;
		/**
		 * "ledger": the design's table on larger screens, day-grouped rows on phones (Movimientos).
		 * "list": compact rows on every size (the Panel's recent movements).
		 */
		variant?: 'ledger' | 'list';
		/** Show the row menu with "Delete" (posts to `?/delete` on the current page). */
		deletable?: boolean;
	}

	let { transactions, locale, timeZone, variant = 'ledger', deletable = false }: Props = $props();

	const dateTime = $derived(
		new Intl.DateTimeFormat(locale, {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
			timeZone
		})
	);
	const shortDate = $derived(
		new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', timeZone })
	);
	const time = $derived(
		new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', timeZone })
	);
	const dayTitle = $derived(
		new Intl.DateTimeFormat(locale, {
			weekday: 'long',
			day: 'numeric',
			month: 'short',
			timeZone: 'UTC'
		})
	);
	const today = $derived(zonedDate(new Date(), timeZone));
	const yesterday = $derived(zonedDate(new Date(Date.now() - 86_400_000), timeZone));
	const groups = $derived(groupByDay(transactions, timeZone));

	function dayLabel(date: string) {
		if (date === today) return m.day_today();
		if (date === yesterday) return m.day_yesterday();
		return dayTitle.format(new Date(`${date}T12:00:00Z`));
	}

	// Keep the current filters (month, kind, account) when posting the named action.
	const deleteAction = $derived(page.url.search ? `${page.url.search}&/delete` : '?/delete');
	const amountClass = (tone: TransactionView['tone']) =>
		tone === 'income' ? 'text-tertiary' : 'text-on-surface';
	const motion = { duration: 200 };
</script>

{#snippet icon(tx: TransactionView, size: string)}
	<span
		class={[
			'flex shrink-0 items-center justify-center rounded-full',
			size,
			tx.tone === 'income'
				? 'bg-primary-fixed text-primary'
				: 'bg-surface-container-low text-on-surface-variant'
		]}
	>
		<tx.icon class="size-5" aria-hidden="true" />
	</span>
{/snippet}

{#snippet amount(tx: TransactionView)}
	<span
		class={[
			'font-display text-label-lg whitespace-nowrap tabular-nums sm:text-title-sm',
			amountClass(tx.tone)
		]}
	>
		{formatMoney(tx.amountMinor, tx.currency, locale, { signed: tx.tone !== 'neutral' })}
	</span>
{/snippet}

{#snippet menu(tx: TransactionView)}
	<details class="relative">
		<summary
			class="flex size-9 cursor-pointer list-none items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-low [&::-webkit-details-marker]:hidden"
			aria-label={m.tx_actions({ name: tx.title })}
		>
			<IconMore class="size-5" aria-hidden="true" />
		</summary>
		<form
			method="POST"
			action={deleteAction}
			use:enhance={() =>
				async ({ result, update }) => {
					if (result.type === 'success') toast(m.tx_deleted());
					await update();
				}}
			class="absolute right-0 z-20 mt-1 w-44 rounded-2xl bg-surface-container-lowest p-2 shadow-lg ring-1 ring-surface-container-high"
		>
			<input type="hidden" name="id" value={tx.id} />
			<button
				type="submit"
				class="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-label-lg text-error hover:bg-error-container"
			>
				<IconDelete class="size-5" aria-hidden="true" />
				{m.tx_delete()}
			</button>
		</form>
	</details>
{/snippet}

{#if variant === 'list'}
	<!-- The design's "Movimientos recientes": title, "Category • Account", amount and date. -->
	<ul class="space-y-1">
		{#each transactions as tx (tx.id)}
			<li
				animate:flip={motion}
				in:fly={{ y: -8, ...motion }}
				out:fade={motion}
				class="flex items-center gap-3 rounded-2xl px-2 py-3 transition-colors hover:bg-surface-container-low"
			>
				{@render icon(tx, 'size-11')}
				<div class="min-w-0 flex-1">
					<p class="truncate text-title-sm">{tx.title}</p>
					<p class="truncate text-body-sm text-on-surface-variant">
						{[tx.categoryName, tx.accountName].filter(Boolean).join(' • ')}
					</p>
				</div>
				<div class="text-right">
					{@render amount(tx)}
					<p class="text-body-sm text-on-surface-variant">
						{shortDate.format(new Date(tx.occurredAt))}, {time.format(new Date(tx.occurredAt))}
					</p>
				</div>
			</li>
		{/each}
	</ul>
{:else}
	<!-- Phones: rows grouped by day ("Today", "Yesterday", "Thursday, Oct 21"). -->
	<div class="space-y-4 md:hidden">
		{#each groups as group (group.date)}
			<section>
				<h3
					class="mb-1 font-sans text-label-sm tracking-wider text-on-surface-variant uppercase first-letter:uppercase"
				>
					{dayLabel(group.date)}
				</h3>
				<ul class="divide-y divide-surface-container">
					{#each group.items as tx (tx.id)}
						<li
							animate:flip={motion}
							in:fly={{ y: -8, ...motion }}
							out:fade={motion}
							class="flex items-center gap-3 py-3"
						>
							{@render icon(tx, 'size-10')}
							<div class="min-w-0 flex-1">
								<p class="truncate text-label-lg">{tx.title}</p>
								<p class="truncate text-body-sm text-on-surface-variant">
									{tx.categoryName ?? tx.accountName} · {time.format(new Date(tx.occurredAt))}
								</p>
							</div>
							{@render amount(tx)}
							{#if deletable}{@render menu(tx)}{/if}
						</li>
					{/each}
				</ul>
			</section>
		{/each}
	</div>

	<!-- Larger screens: the design's ledger table. -->
	<table class="hidden w-full text-left md:table">
		<thead>
			<tr class="text-label-sm tracking-wider text-on-surface-variant uppercase">
				<th class="py-3 pl-2 font-semibold">{m.activity_col_movement()}</th>
				<th class="py-3 font-semibold">{m.activity_col_category()}</th>
				<th class="py-3 font-semibold">{m.activity_col_account()}</th>
				<th class="py-3 text-right font-semibold">{m.activity_col_amount()}</th>
				{#if deletable}<th class="w-14 py-3"
						><span class="sr-only">{m.activity_col_action()}</span></th
					>{/if}
			</tr>
		</thead>
		<tbody>
			{#each transactions as tx (tx.id)}
				<tr
					animate:flip={motion}
					in:fade={motion}
					out:fade={motion}
					class="border-t border-surface-container transition-colors hover:bg-surface-container-low/60"
				>
					<td class="py-4 pl-2">
						<div class="flex items-center gap-3">
							{@render icon(tx, 'size-10')}
							<div class="min-w-0">
								<p class="truncate text-title-sm">{tx.title}</p>
								<p class="text-body-sm text-on-surface-variant">
									{dateTime.format(new Date(tx.occurredAt))}
								</p>
							</div>
						</div>
					</td>
					<td class="py-4">
						{#if tx.categoryName}
							<span
								class={[
									'inline-flex items-center gap-1 rounded-full px-3 py-1 text-label-md',
									tx.tone === 'income'
										? 'bg-primary-fixed text-on-primary-fixed-variant'
										: 'bg-surface-container text-on-surface-variant'
								]}
							>
								{#if tx.tone === 'income'}<span class="size-1.5 rounded-full bg-primary"
									></span>{/if}
								{tx.categoryName}
							</span>
						{/if}
					</td>
					<td class="py-4 text-body-md text-on-surface-variant">{tx.accountName}</td>
					<td class="py-4 text-right">{@render amount(tx)}</td>
					{#if deletable}<td class="py-4 text-right">{@render menu(tx)}</td>{/if}
				</tr>
			{/each}
		</tbody>
	</table>
{/if}
