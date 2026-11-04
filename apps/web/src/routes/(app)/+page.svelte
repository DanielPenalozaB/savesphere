<script lang="ts">
	import IconBalance from '~icons/material-symbols/account-balance-outline';
	import IconExpense from '~icons/material-symbols/arrow-outward';
	import IconIncome from '~icons/material-symbols/south-west';
	import IconSlack from '~icons/material-symbols/auto-awesome-outline';
	import IconArrow from '~icons/material-symbols/chevron-right';
	import IconInsight from '~icons/material-symbols/lightbulb-outline';
	import IconSavings from '~icons/material-symbols/savings-outline';
	import IconTrendDown from '~icons/material-symbols/trending-down';
	import IconTrendUp from '~icons/material-symbols/trending-up';
	import { minorUnitOf } from '@savesphere/contracts';
	import { resolve } from '$app/paths';
	import { categoryLabel } from '#lib/categories.ts';
	import AccountForm from '#lib/components/ledger/account-form.svelte';
	import AccountsCard from '#lib/components/ledger/accounts-card.svelte';
	import GoalsCard from '#lib/components/ledger/goals-card.svelte';
	import KpiCard from '#lib/components/ledger/kpi-card.svelte';
	import RecordButton from '#lib/components/ledger/record-button.svelte';
	import TransactionList from '#lib/components/ledger/transaction-list.svelte';
	import { percentChange, topExpenseCategory, weekOfMonth, weekdayRhythm } from '#lib/insights.ts';
	import { formatMoney } from '#lib/money.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { plural } from '#lib/plural.ts';
	import { getLocale } from '#lib/paraglide/runtime.js';
	import { monthLabel, totalsIn } from '#lib/summary.ts';
	import { describeTransaction } from '#lib/transactions.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const firstName = $derived(data.user.name.split(' ')[0] ?? data.user.name);
	const base = $derived(data.settings.baseCurrency);
	const money = (minor: number, signed = false) =>
		formatMoney(minor, base, data.locale, { signed });
	const percent = (value: number) =>
		new Intl.NumberFormat(data.locale, {
			maximumFractionDigits: 1,
			signDisplay: 'exceptZero'
		}).format(value);

	// Net worth only adds accounts in the base currency; others are listed, never converted.
	const counted = $derived(data.accounts.filter((a) => a.includeInTotals));
	const netWorth = $derived(
		counted.filter((a) => a.currency === base).reduce((sum, a) => sum + a.balanceMinor, 0)
	);
	const otherCurrencies = $derived([
		...new Set(counted.filter((a) => a.currency !== base).map((a) => a.currency))
	]);

	const totals = $derived(data.summary ? totalsIn(data.summary, base) : null);
	const previous = $derived(data.previous ? totalsIn(data.previous, base) : null);
	const slack = $derived(totals ? totals.incomeMinor - totals.expenseMinor : 0);
	const netWorthTrend = $derived(totals ? percentChange(netWorth, netWorth - slack) : null);
	const incomeTrend = $derived(
		totals && previous ? percentChange(totals.incomeMinor, previous.incomeMinor) : null
	);
	const spentShare = $derived(
		totals && totals.incomeMinor > 0
			? Math.round((totals.expenseMinor / totals.incomeMinor) * 100)
			: null
	);
	const flowMax = $derived(totals ? Math.max(totals.incomeMinor, totals.expenseMinor, 1) : 1);

	const week = $derived(data.today ? weekOfMonth(data.today, data.settings.weekStartsOn) : null);
	const dayOfMonth = $derived(data.today ? Number(data.today.slice(8, 10)) : 1);
	// Whole currency units: "$ 68.574 / día", not centavos.
	const dailyAverage = $derived.by(() => {
		if (!totals) return 0;
		const unit = 10 ** minorUnitOf(base);
		return Math.round(totals.expenseMinor / dayOfMonth / unit) * unit;
	});
	const rhythm = $derived(
		weekdayRhythm(
			data.monthExpenses.filter((tx) =>
				data.accounts.some((a) => a.id === tx.entries[0]?.accountId && a.currency === base)
			),
			{
				timeZone: data.settings.timezone,
				locale: getLocale(),
				weekStartsOn: data.settings.weekStartsOn
			}
		)
	);

	// "Perspectiva del mes": the category taking the largest share of this month's spending.
	const topCategory = $derived.by(() => {
		const top = topExpenseCategory(data.monthExpenses);
		const category = data.categories.find((c) => c.id === top?.categoryId);
		if (!top || !category || !totals?.expenseMinor) return null;
		return {
			name: categoryLabel(category),
			amount: top.amountMinor,
			share: Math.round((top.amountMinor / totals.expenseMinor) * 100)
		};
	});

	const intro = $derived(
		!totals
			? m.home_intro_empty()
			: totals.incomeCount + totals.expenseCount === 0
				? m.home_intro_neutral()
				: slack >= 0
					? m.home_intro_positive()
					: m.home_intro_negative()
	);
	const recent = $derived(
		data.recent.map((tx) => describeTransaction(tx, data.accounts, data.categories))
	);
</script>

<svelte:head>
	<title>{m.nav_home()} · {m.app_name()}</title>
</svelte:head>

{#snippet trend(value: number | null, label: string)}
	<!-- A flat 0% says nothing, so it's hidden like a missing comparison. -->
	{#if value !== null && value !== 0}
		<span class="inline-flex items-center gap-1 font-semibold text-primary">
			{#if value >= 0}<IconTrendUp class="size-4" aria-hidden="true" />{:else}<IconTrendDown
					class="size-4"
					aria-hidden="true"
				/>{/if}
			{percent(value)}%
		</span>
		{label}
	{/if}
{/snippet}

<header class="mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-end md:justify-between">
	<div>
		{#if data.month}
			<p class="mb-3 flex flex-wrap items-center gap-2 text-label-md">
				<span
					class="inline-flex items-center gap-1.5 rounded-full bg-primary-fixed px-3 py-1 text-on-primary-fixed-variant"
				>
					<span class="size-1.5 rounded-full bg-primary-container"></span>
					<span class="first-letter:uppercase"
						>{m.home_month_chip({
							month: monthLabel(data.month.year, data.month.month, data.locale)
						})}</span
					>
				</span>
				<span class="text-on-surface-variant">• {m.home_currency_chip({ currency: base })}</span>
			</p>
		{/if}
		<h1 class="text-headline-lg md:text-headline-xl">
			{m.home_greeting({ name: firstName })} <span aria-hidden="true">👋</span>
		</h1>
		<p class="mt-1 max-w-xl text-body-lg text-on-surface-variant">{intro}</p>
	</div>
	{#if data.accounts.length > 0}
		<!-- On phones the floating + in the tab bar is the record action. -->
		<div class="hidden flex-wrap gap-3 md:flex">
			<a
				href={resolve('goals/new')}
				class="inline-flex items-center gap-2 rounded-full bg-surface-container-lowest px-5 py-2.5 text-label-lg text-on-surface shadow-[0_1px_8px_rgba(0,0,0,0.06)] transition hover:bg-surface-container-low"
			>
				<IconSavings class="size-5 text-primary" aria-hidden="true" />
				{m.sidebar_add_vault()}
			</a>
			<RecordButton />
		</div>
	{/if}
</header>

{#if data.accounts.length === 0}
	<section class="max-w-2xl card md:p-10">
		<h2 class="text-headline-md">{m.account_form_title()}</h2>
		<p class="mt-1 mb-6 text-on-surface-variant">{m.account_form_intro()}</p>
		<AccountForm defaultCurrency={base} />
	</section>
{:else if totals}
	<div class="mb-4 grid grid-cols-2 gap-3 md:mb-6 md:gap-4 xl:grid-cols-4">
		<KpiCard label={m.kpi_net_worth()} value={money(netWorth)} icon={IconBalance}>
			{#if otherCurrencies.length}
				{m.kpi_other_currencies({ currencies: otherCurrencies.join(', ') })}
			{:else}
				{@render trend(netWorthTrend, m.kpi_this_month())}
			{/if}
		</KpiCard>
		<KpiCard
			label={m.kpi_income()}
			value={money(totals.incomeMinor)}
			icon={IconIncome}
			tone="income"
		>
			{#if incomeTrend !== null}
				{@render trend(incomeTrend, m.kpi_vs_last_month())}
			{:else}
				{plural(totals.incomeCount, m.kpi_income_count_one, m.kpi_income_count)}
			{/if}
		</KpiCard>
		<KpiCard
			label={m.kpi_expenses()}
			value={money(totals.expenseMinor)}
			icon={IconExpense}
			tone="expense"
		>
			<span class="inline-flex items-center gap-1.5">
				<span class="size-1.5 rounded-full bg-primary-container"></span>
				{spentShare !== null
					? m.kpi_spent_share({ percent: spentShare })
					: plural(totals.expenseCount, m.kpi_expense_count_one, m.kpi_expense_count)}
			</span>
		</KpiCard>
		<KpiCard label={m.kpi_slack()} value={money(slack, true)} icon={IconSlack} variant="dark">
			{m.kpi_slack_hint()}
		</KpiCard>
	</div>

	<div
		class="mb-4 grid gap-4 md:mb-6 lg:grid-cols-2 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)]"
	>
		<section class="card lg:col-span-2 xl:col-span-1">
			<header class="mb-5 flex items-start justify-between gap-3">
				<div>
					<h2 class="text-headline-md">{m.home_cash_flow()}</h2>
					<p class="text-body-sm text-on-surface-variant">{m.home_cash_flow_intro()}</p>
				</div>
				{#if week}
					<span
						class="shrink-0 rounded-full bg-surface-container-low px-3 py-1 text-label-md text-on-surface-variant"
						>{m.home_week_of({ week: week.week, weeks: week.weeks })}</span
					>
				{/if}
			</header>
			<dl class="space-y-4">
				{#each [{ label: m.kpi_income(), value: totals.incomeMinor, color: 'bg-primary-container' }, { label: m.kpi_expenses(), value: totals.expenseMinor, color: 'bg-on-surface-variant' }] as row (row.label)}
					<div>
						<div class="mb-2 flex items-center justify-between text-label-lg">
							<dt class="flex items-center gap-2">
								<span class={['size-2.5 rounded-full', row.color]}></span>{row.label}
							</dt>
							<dd class="tabular-nums">{money(row.value)}</dd>
						</div>
						<div class="h-3 overflow-hidden rounded-full bg-surface-container-high">
							<div
								class={['h-full rounded-full transition-[width] duration-700', row.color]}
								style:width="{(row.value / flowMax) * 100}%"
							></div>
						</div>
					</div>
				{/each}
			</dl>

			<div class="mt-6">
				<div class="mb-3 flex flex-wrap items-center justify-between gap-2 text-label-sm uppercase">
					<span class="tracking-wider text-on-surface-variant">{m.home_rhythm()}</span>
					<span class="text-primary normal-case"
						>{m.home_daily_average({ amount: money(dailyAverage) })}</span
					>
				</div>
				<!-- The design's dot matrix: up to three dots per weekday, by share of spending. -->
				<div
					class="grid grid-cols-7 gap-1 rounded-3xl bg-surface-container-low px-3 py-4"
					role="img"
					aria-label={rhythm.map((d) => `${d.label}: ${money(d.expenseMinor)}`).join(', ')}
				>
					{#each rhythm as day (day.weekday)}
						<div class="flex flex-col items-center gap-1.5">
							<span class="mb-1 text-label-md text-on-surface-variant">{day.label}</span>
							{#each [3, 2, 1] as dot (dot)}
								<span
									class={[
										'size-3.5 rounded-full transition-colors',
										day.level >= dot
											? dot === 3
												? 'bg-on-surface-variant'
												: 'bg-primary-container'
											: 'bg-surface-container-high'
									]}
								></span>
							{/each}
						</div>
					{/each}
				</div>
			</div>
		</section>
		<AccountsCard accounts={data.accounts} locale={data.locale} />
		<GoalsCard goals={data.goals} locale={data.locale} />
	</div>

	<div class="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
		<section class="card">
			<header class="mb-2 flex items-start justify-between gap-4">
				<div>
					<h2 class="text-headline-md">{m.home_recent()}</h2>
					<p class="text-body-sm text-on-surface-variant">{m.home_recent_intro()}</p>
				</div>
				<a
					href={resolve('activity')}
					class="inline-flex shrink-0 items-center text-label-lg text-primary hover:underline"
					>{m.home_view_all()}<IconArrow class="size-5" aria-hidden="true" /></a
				>
			</header>
			{#if recent.length === 0}
				<p class="py-8 text-center text-on-surface-variant">{m.home_recent_empty()}</p>
			{:else}
				<TransactionList
					transactions={recent}
					locale={data.locale}
					timeZone={data.settings.timezone}
					variant="list"
				/>
			{/if}
		</section>

		<!-- Styled after the design's "Perspectiva Serena"; computed from your data, no AI needed. -->
		<section class="flex flex-col gap-4 rounded-card bg-surface-container-low p-6">
			<header class="flex items-center gap-2">
				<span
					class="flex size-9 items-center justify-center rounded-full bg-primary-container text-on-primary"
				>
					<IconInsight class="size-5" aria-hidden="true" />
				</span>
				<h2 class="text-title-sm">{m.home_insight_title()}</h2>
			</header>
			{#if topCategory}
				<p class="font-display text-headline-md">
					{m.home_insight_top_prefix()}
					<span class="text-primary">{topCategory.name}</span>
				</p>
				<p class="text-body-md text-on-surface-variant">
					{m.home_insight_top_body({
						amount: money(topCategory.amount),
						share: topCategory.share
					})}
				</p>
			{:else}
				<p class="text-body-md text-on-surface-variant">{m.home_insight_empty()}</p>
			{/if}
			<div class="mt-auto rounded-2xl bg-surface-container-lowest p-4 text-body-sm">
				<p class="font-semibold">{m.home_insight_tip_title()}</p>
				<p class="text-on-surface-variant">
					{slack >= 0
						? m.home_insight_tip_positive({ amount: money(slack) })
						: m.home_insight_tip_negative({ amount: money(-slack) })}
				</p>
			</div>
		</section>
	</div>
{/if}
