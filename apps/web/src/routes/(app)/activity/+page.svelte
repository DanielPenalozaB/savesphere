<script lang="ts">
	import IconExpense from '~icons/material-symbols/arrow-outward';
	import IconIncome from '~icons/material-symbols/south-west';
	import IconFlow from '~icons/material-symbols/trending-up';
	import IconLeft from '~icons/material-symbols/chevron-left';
	import IconRight from '~icons/material-symbols/chevron-right';
	import IconCount from '~icons/material-symbols/receipt-long-outline';
	import IconTrendDown from '~icons/material-symbols/trending-down';
	import IconTrendUp from '~icons/material-symbols/trending-up';
	import { percentChange } from '#lib/insights.ts';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { formatMonthParam, shiftMonth } from '#lib/dates.ts';
	import KpiCard from '#lib/components/ledger/kpi-card.svelte';
	import RecordButton from '#lib/components/ledger/record-button.svelte';
	import TransactionList from '#lib/components/ledger/transaction-list.svelte';
	import PageHeader from '#lib/components/page-header.svelte';
	import { formatMoney } from '#lib/money.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { plural } from '#lib/plural.ts';
	import { monthLabel, totalsIn } from '#lib/summary.ts';
	import { describeTransaction } from '#lib/transactions.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const totals = $derived(totalsIn(data.summary, data.settings.baseCurrency));
	const net = $derived(totals.incomeMinor - totals.expenseMinor);
	const previous = $derived(totalsIn(data.previous, data.settings.baseCurrency));
	const netTrend = $derived(percentChange(net, previous.incomeMinor - previous.expenseMinor));
	const money = (minor: number, signed = false) =>
		formatMoney(minor, data.settings.baseCurrency, data.locale, { signed });
	const rows = $derived(
		data.page.items.map((tx) => describeTransaction(tx, data.accounts, data.categories))
	);

	/** Activity URL keeping the current filters, with `changes` applied (null removes a param). */
	function activityHref(changes: Record<string, string | null>) {
		const current: Record<string, string | null> = {
			month: formatMonthParam(data.month),
			kind: data.filters.kind,
			account: data.filters.accountId
		};
		const query = Object.entries({ ...current, ...changes })
			.filter((entry): entry is [string, string] => entry[1] !== null)
			.map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
			.join('&');
		return resolve(`activity?${query}`);
	}

	const kinds = [
		{ value: null, label: m.kind_all },
		{ value: 'expense', label: m.kind_expense },
		{ value: 'income', label: m.kind_income },
		{ value: 'transfer', label: m.kind_transfer }
	] as const;
	const chip =
		'inline-flex items-center gap-1 rounded-full px-4 py-2 text-label-lg transition-colors';
</script>

<svelte:head>
	<title>{m.activity_title()} · {m.app_name()}</title>
</svelte:head>

<PageHeader title={m.activity_title()} intro={m.activity_intro()}>
	<!-- On phones the floating + in the tab bar is the record action. -->
	<div class="hidden md:block"><RecordButton /></div>
</PageHeader>

<div class="mb-6 grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
	<KpiCard label={m.kpi_net_flow()} value={money(net, true)} icon={IconFlow}>
		{#if netTrend !== null}
			<span class="inline-flex items-center gap-1 font-semibold text-primary">
				{#if netTrend >= 0}<IconTrendUp class="size-4" aria-hidden="true" />{:else}<IconTrendDown
						class="size-4"
						aria-hidden="true"
					/>{/if}
				{netTrend > 0 ? '+' : ''}{netTrend}%
			</span>
			{m.kpi_vs_last_month()}
		{/if}
	</KpiCard>
	<KpiCard label={m.kpi_income()} value={money(totals.incomeMinor)} icon={IconIncome} tone="income">
		{plural(totals.incomeCount, m.kpi_income_count_one, m.kpi_income_count)}
	</KpiCard>
	<KpiCard
		label={m.kpi_expenses()}
		value={money(totals.expenseMinor)}
		icon={IconExpense}
		tone="expense"
	>
		{plural(totals.expenseCount, m.kpi_expense_count_one, m.kpi_expense_count)}
	</KpiCard>
	<KpiCard
		label={m.activity_title()}
		value={String(totals.count)}
		icon={IconCount}
		variant="dark"
	/>
</div>

<section class="card max-md:px-4">
	<!-- Sticky on phones so the month and filters stay in reach while scrolling. -->
	<div
		class="sticky top-16 z-10 -mx-4 mb-4 flex flex-col gap-3 bg-surface-container-lowest/95 px-4 py-2 backdrop-blur md:static md:mx-0 md:bg-transparent md:px-0 md:py-0 lg:flex-row lg:items-center lg:justify-between"
	>
		<div class="flex items-center gap-1">
			<a
				href={activityHref({ month: formatMonthParam(shiftMonth(data.month, -1)), cursor: null })}
				aria-label={m.activity_prev_month()}
				class="flex size-9 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-low"
			>
				<IconLeft class="size-6" aria-hidden="true" />
			</a>
			<h2 class="min-w-40 text-center text-headline-md first-letter:uppercase">
				{monthLabel(data.month.year, data.month.month, data.locale)}
			</h2>
			<span
				class="ml-1 rounded-full bg-surface-container-low px-2.5 py-0.5 text-label-md whitespace-nowrap text-on-surface-variant"
				>{plural(totals.count, m.activity_month_count_one, m.activity_month_count)}</span
			>
			{#if !data.isCurrentMonth}
				<a
					href={activityHref({ month: formatMonthParam(shiftMonth(data.month, 1)), cursor: null })}
					aria-label={m.activity_next_month()}
					class="flex size-9 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-low"
				>
					<IconRight class="size-6" aria-hidden="true" />
				</a>
			{/if}
		</div>

		<div
			class="-mx-4 flex [scrollbar-width:none] items-center gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:overflow-visible md:px-0"
		>
			{#each kinds as kind (kind.value)}
				{@const active = data.filters.kind === kind.value}
				<a
					href={activityHref({ kind: kind.value, cursor: null })}
					aria-current={active ? 'true' : undefined}
					class={[
						chip,
						'shrink-0',
						active
							? 'bg-primary-container text-on-primary'
							: 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
					]}>{kind.label()}</a
				>
			{/each}
			{#if data.accounts.length > 1}
				<form method="GET" class="contents">
					<input type="hidden" name="month" value={formatMonthParam(data.month)} />
					{#if data.filters.kind}<input type="hidden" name="kind" value={data.filters.kind} />{/if}
					<label class="sr-only" for="account-filter">{m.activity_filter_account()}</label>
					<select
						id="account-filter"
						name="account"
						value={data.filters.accountId ?? ''}
						onchange={(event) =>
							goto(activityHref({ account: event.currentTarget.value || null, cursor: null }))}
						class="rounded-full border-0 bg-surface-container-low py-2 pr-9 pl-4 text-label-lg text-on-surface-variant focus:ring-2 focus:ring-primary-container"
					>
						<option value="">{m.activity_filter_all_accounts()}</option>
						{#each data.accounts as account (account.id)}
							<option value={account.id}>{account.name}</option>
						{/each}
					</select>
					<noscript><button type="submit" class={chip}>OK</button></noscript>
				</form>
			{/if}
		</div>
	</div>

	{#if rows.length === 0}
		<div class="flex flex-col items-center gap-3 py-12 text-center">
			<p class="text-on-surface-variant">{m.activity_empty()}</p>
			{#if data.isCurrentMonth}<RecordButton />{/if}
		</div>
	{:else}
		<TransactionList
			transactions={rows}
			locale={data.locale}
			timeZone={data.settings.timezone}
			deletable
		/>
	{/if}

	{#if data.page.nextCursor || !data.isFirstPage}
		<nav class="mt-4 flex justify-between border-t border-surface-container pt-4">
			{#if !data.isFirstPage}
				<a href={activityHref({ cursor: null })} class="text-label-lg text-primary hover:underline"
					>{m.activity_newest()}</a
				>
			{:else}<span></span>{/if}
			{#if data.page.nextCursor}
				<a
					href={activityHref({ cursor: data.page.nextCursor })}
					class="text-label-lg text-primary hover:underline">{m.activity_older()}</a
				>
			{/if}
		</nav>
	{/if}
</section>
