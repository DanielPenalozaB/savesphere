<script lang="ts">
	import IconAdd from '~icons/material-symbols/add';
	import IconBalance from '~icons/material-symbols/account-balance-outline';
	import IconMonthly from '~icons/material-symbols/event-repeat-outline';
	import IconSaved from '~icons/material-symbols/savings-outline';
	import { permille } from '@savesphere/core';
	import { resolve } from '$app/paths';
	import BalanceSheetCard from '#lib/components/goals/balance-sheet-card.svelte';
	import GoalCard from '#lib/components/goals/goal-card.svelte';
	import KpiCard from '#lib/components/ledger/kpi-card.svelte';
	import PageHeader from '#lib/components/page-header.svelte';
	import { balanceSheet, goalProgress, sortGoals } from '#lib/goals.ts';
	import { formatMoney } from '#lib/money.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { plural } from '#lib/plural.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const base = $derived(data.settings.baseCurrency);
	const money = (minor: number) => formatMoney(minor, base, data.locale);
	const percent = (value: number) =>
		new Intl.NumberFormat(data.locale, { style: 'percent', maximumFractionDigits: 1 }).format(
			value / 1000
		);

	const goals = $derived(
		sortGoals(data.allGoals).map((goal) => ({ goal, progress: goalProgress(goal, data.today) }))
	);
	const active = $derived(goals.filter(({ goal }) => goal.status === 'active'));
	const others = $derived(goals.filter(({ goal }) => goal.status !== 'active'));

	// KPIs only add active goals in the base currency; others are listed, never converted.
	const counted = $derived(active.filter(({ goal }) => goal.currency === base));
	const saved = $derived(counted.reduce((sum, { goal }) => sum + Math.max(0, goal.savedMinor), 0));
	const target = $derived(counted.reduce((sum, { goal }) => sum + goal.targetMinor, 0));
	const monthly = $derived(
		counted.reduce((sum, { progress }) => sum + (progress.monthlyMinor ?? 0), 0)
	);
	const sheet = $derived(balanceSheet(data.accounts, base));
</script>

<svelte:head>
	<title>{m.goals_title()} · {m.app_name()}</title>
</svelte:head>

<PageHeader title={m.goals_title()} intro={m.goals_intro()}>
	<a
		href={resolve('goals/new')}
		class="inline-flex items-center justify-center gap-2 self-start rounded-full bg-primary-container px-5 py-2.5 text-title-sm text-on-primary shadow-lg shadow-primary-container/25 transition hover:brightness-105 md:self-auto"
	>
		<IconAdd class="size-5" aria-hidden="true" />{m.goals_new()}
	</a>
</PageHeader>

<div class="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-3">
	<KpiCard label={m.goals_kpi_saved()} value={money(saved)} icon={IconSaved}>
		{m.goals_kpi_progress({ percent: percent(permille(saved, target)), target: money(target) })}
	</KpiCard>
	<KpiCard label={m.goals_kpi_monthly()} value={money(monthly)} icon={IconMonthly}>
		{m.goals_kpi_monthly_hint()}
	</KpiCard>
	<div class="col-span-2 xl:col-span-1">
		<KpiCard
			label={m.goals_kpi_net_worth()}
			value={money(sheet.netMinor)}
			icon={IconBalance}
			variant="dark"
		>
			{m.goals_kpi_net_worth_hint({ currency: base })}
		</KpiCard>
	</div>
</div>

<section class="mt-8" aria-labelledby="active-goals">
	<header class="mb-4 flex flex-wrap items-center gap-3">
		<h2 id="active-goals" class="text-headline-md">{m.goals_active_heading()}</h2>
		<span
			class="rounded-full bg-surface-container-high px-2.5 py-1 text-label-sm text-on-surface-variant"
			>{plural(active.length, m.goals_kpi_active_one, m.goals_kpi_active)}</span
		>
	</header>
	<div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
		{#each active as { goal, progress } (goal.id)}
			<GoalCard {goal} {progress} locale={data.locale} />
		{/each}
		<a
			href={resolve('goals/new')}
			class="flex min-h-48 flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed border-outline-variant/60 p-6 text-center transition hover:border-primary-container hover:bg-surface-container-low"
		>
			<span
				class="flex size-12 items-center justify-center rounded-full bg-surface-container-lowest text-primary shadow-sm"
			>
				<IconAdd class="size-6" aria-hidden="true" />
			</span>
			<span class="text-title-lg">{m.goals_add_card_title()}</span>
			<span class="max-w-xs text-body-sm text-on-surface-variant">{m.goals_add_card_body()}</span>
		</a>
	</div>
</section>

<div class="mt-8 grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
	<BalanceSheetCard {sheet} currency={base} locale={data.locale} />
	{#if others.length > 0}
		<section aria-labelledby="other-goals">
			<h2 id="other-goals" class="text-title-lg mb-4">{m.goals_other_heading()}</h2>
			<div class="grid gap-4">
				{#each others as { goal, progress } (goal.id)}
					<GoalCard {goal} {progress} locale={data.locale} />
				{/each}
			</div>
		</section>
	{/if}
</div>
