<script lang="ts">
	import IconEdit from '~icons/material-symbols/tune';
	import IconLimit from '~icons/material-symbols/account-balance-wallet-outline';
	import IconNeeds from '~icons/material-symbols/home-outline';
	import IconSavings from '~icons/material-symbols/savings-outline';
	import IconSpent from '~icons/material-symbols/shopping-bag-outline';
	import IconWants from '~icons/material-symbols/interests-outline';
	import IconCheck from '~icons/material-symbols/check-circle-outline';
	import type { BudgetBucket } from '@savesphere/contracts';
	import { bucketTotals, disciplineScore, permille } from '@savesphere/core';
	import { resolve } from '$app/paths';
	import { BUCKETS, BUCKET_TARGET_PCT, envelopeViews, monthProgress } from '#lib/budgets.ts';
	import EnvelopeCard from '#lib/components/budgets/envelope-card.svelte';
	import KpiCard from '#lib/components/ledger/kpi-card.svelte';
	import PageHeader from '#lib/components/page-header.svelte';
	import { formatMoney } from '#lib/money.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { plural } from '#lib/plural.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const progress = $derived(data.today ? monthProgress(data.today) : null);
	const envelopes = $derived(
		data.budget && data.spending && progress
			? envelopeViews(data.budget, data.spending, progress)
			: []
	);
	const currency = $derived(data.budget?.currency ?? data.settings.baseCurrency);
	const money = (minor: number) => formatMoney(minor, currency, data.locale);
	const percent = (permilleValue: number) =>
		new Intl.NumberFormat(data.locale, { style: 'percent', maximumFractionDigits: 1 }).format(
			permilleValue / 1000
		);

	const totalLimit = $derived(envelopes.reduce((sum, e) => sum + e.limitMinor, 0));
	const totalSpent = $derived(envelopes.reduce((sum, e) => sum + e.spentMinor, 0));
	const remaining = $derived(totalLimit - totalSpent);
	const buckets = $derived(bucketTotals(envelopes));
	const score = $derived(disciplineScore(envelopes.map((e) => ({ ...e, alertThresholdPct: 100 }))));
	const overCount = $derived(envelopes.filter((e) => e.state === 'over').length);

	const categoryById = $derived(new Map(data.categories.map((c) => [c.id, c])));
	const bucketMeta: Record<
		BudgetBucket,
		{ title: () => string; intro: () => string; short: () => string; icon: typeof IconNeeds }
	> = {
		needs: {
			title: m.budgets_bucket_needs,
			intro: m.budgets_bucket_needs_intro,
			short: m.budgets_bucket_short_needs,
			icon: IconNeeds
		},
		wants: {
			title: m.budgets_bucket_wants,
			intro: m.budgets_bucket_wants_intro,
			short: m.budgets_bucket_short_wants,
			icon: IconWants
		},
		savings: {
			title: m.budgets_bucket_savings,
			intro: m.budgets_bucket_savings_intro,
			short: m.budgets_bucket_short_savings,
			icon: IconSavings
		}
	};
	const bucketBar: Record<BudgetBucket, string> = {
		needs: 'bg-inverse-surface',
		wants: 'bg-primary-container',
		savings: 'bg-tertiary'
	};
	const circumference = 2 * Math.PI * 42;
</script>

<svelte:head>
	<title>{m.budgets_title()} · {m.app_name()}</title>
</svelte:head>

<PageHeader title={m.budgets_title()} intro={m.budgets_intro()}>
	{#if data.budget}
		<a
			href={resolve('budgets/edit')}
			class="inline-flex items-center justify-center gap-2 self-start rounded-full bg-primary-container px-5 py-2.5 text-title-sm text-on-primary shadow-lg shadow-primary-container/25 transition hover:brightness-105 md:self-auto"
		>
			<IconEdit class="size-5" aria-hidden="true" />{m.budgets_edit()}
		</a>
	{/if}
</PageHeader>

{#if !data.budget || !progress}
	<section class="flex max-w-xl flex-col items-start gap-4 card">
		<span
			class="flex size-12 items-center justify-center rounded-full bg-primary-fixed text-primary"
		>
			<IconLimit class="size-6" aria-hidden="true" />
		</span>
		<div>
			<h2 class="text-headline-md">{m.budgets_empty_title()}</h2>
			<p class="mt-1 text-body-md text-on-surface-variant">{m.budgets_empty_body()}</p>
		</div>
		<a
			href={resolve('budgets/edit')}
			class="rounded-full bg-primary-container px-6 py-3 text-title-sm text-on-primary shadow-lg shadow-primary-container/25 transition hover:brightness-105"
			>{m.budgets_create()}</a
		>
	</section>
{:else}
	<div class="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
		<KpiCard label={m.budgets_kpi_limit()} value={money(totalLimit)} icon={IconLimit}>
			{plural(envelopes.length, m.budgets_envelopes_one, m.budgets_envelopes)}
		</KpiCard>
		<KpiCard
			label={m.budgets_kpi_spent()}
			value={money(totalSpent)}
			icon={IconSpent}
			tone="expense"
		>
			{m.budgets_kpi_used({ percent: percent(permille(totalSpent, totalLimit)) })}
		</KpiCard>
		<KpiCard label={m.budgets_kpi_remaining()} value={money(remaining)} icon={IconSavings}>
			{m.budgets_kpi_available({
				percent: percent(Math.max(0, 1000 - permille(totalSpent, totalLimit)))
			})}
		</KpiCard>
		<article
			class="flex flex-col justify-between gap-3 rounded-[1.5rem] bg-inverse-surface p-4 text-inverse-on-surface shadow-xl md:rounded-card md:p-6"
		>
			<h3 class="text-label-sm tracking-wider text-primary-fixed-dim uppercase md:text-label-md">
				{m.budgets_kpi_cycle()}
			</h3>
			<p class="flex items-baseline gap-2">
				<span class="font-display text-headline-md md:text-headline-lg"
					>{m.budgets_kpi_day({ day: progress.day })}</span
				>
				<span class="text-body-sm text-inverse-on-surface/70"
					>{m.budgets_kpi_of_days({ days: progress.days })}</span
				>
			</p>
			<div class="h-2 overflow-hidden rounded-full bg-white/15">
				<div
					class="h-full rounded-full bg-primary-container"
					style:width="{(progress.day / progress.days) * 100}%"
				></div>
			</div>
		</article>
	</div>

	<div class="mt-6 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
		<div class="space-y-6">
			{#each BUCKETS as bucket (bucket)}
				{@const items = envelopes.filter((e) => e.bucket === bucket)}
				{@const meta = bucketMeta[bucket]}
				{#if items.length > 0}
					<section class="card" aria-labelledby="bucket-{bucket}">
						<header class="mb-4 flex flex-wrap items-start justify-between gap-3">
							<div class="flex min-w-0 items-start gap-3">
								<span
									class="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface-container-low text-primary"
								>
									<meta.icon class="size-5" aria-hidden="true" />
								</span>
								<div class="min-w-0">
									<h2 id="bucket-{bucket}" class="text-title-lg flex flex-wrap items-center gap-2">
										{meta.title()}
										<span
											class="rounded-full bg-primary-fixed px-2 py-0.5 text-label-sm text-on-primary-fixed-variant"
											>{m.budgets_bucket_target({ percent: BUCKET_TARGET_PCT[bucket] })}</span
										>
									</h2>
									<p class="text-body-sm text-on-surface-variant">{meta.intro()}</p>
								</div>
							</div>
							<p class="text-body-md tabular-nums">
								<span class="font-semibold">{money(buckets[bucket].spentMinor)}</span>
								<span class="text-on-surface-variant">/ {money(buckets[bucket].limitMinor)}</span>
							</p>
						</header>
						<div class="grid gap-3 sm:grid-cols-2">
							{#each items as envelope (envelope.categoryId)}
								<EnvelopeCard
									{envelope}
									category={categoryById.get(envelope.categoryId)}
									{currency}
									locale={data.locale}
								/>
							{/each}
						</div>
					</section>
				{/if}
			{/each}
		</div>

		<aside class="space-y-6">
			<section class="card">
				<header class="mb-4 flex items-center justify-between">
					<h2 class="text-label-md tracking-wider text-on-surface-variant uppercase">
						{m.budgets_health()}
					</h2>
					<IconCheck class="size-5 text-primary" aria-hidden="true" />
				</header>
				<div class="relative mx-auto size-40">
					<svg viewBox="0 0 100 100" class="size-full -rotate-90" aria-hidden="true">
						<circle
							cx="50"
							cy="50"
							r="42"
							fill="none"
							stroke-width="9"
							class="stroke-surface-container-high"
						/>
						<circle
							cx="50"
							cy="50"
							r="42"
							fill="none"
							stroke="currentColor"
							stroke-width="9"
							stroke-linecap="round"
							stroke-dasharray={circumference}
							stroke-dashoffset={circumference * (1 - score / 100)}
							class="text-primary-container transition-[stroke-dashoffset] duration-700"
						/>
					</svg>
					<p class="absolute inset-0 flex flex-col items-center justify-center text-center">
						<span class="font-display text-headline-lg tabular-nums">{score}%</span>
						<span
							class="max-w-[6.5rem] text-[0.625rem] leading-tight text-on-surface-variant uppercase"
							>{m.budgets_health_score()}</span
						>
					</p>
				</div>
				<dl class="mt-4 grid grid-cols-2 gap-2">
					<div class="rounded-2xl bg-surface-container-low px-3 py-2">
						<dt class="text-label-sm text-on-surface-variant">{m.budgets_health_within()}</dt>
						<dd class="text-title-sm">
							{plural(envelopes.length - overCount, m.budgets_envelopes_one, m.budgets_envelopes)}
						</dd>
					</div>
					<div class="rounded-2xl bg-surface-container-low px-3 py-2">
						<dt class="text-label-sm text-on-surface-variant">{m.budgets_health_over()}</dt>
						<dd class={['text-title-sm', overCount > 0 && 'text-error']}>
							{plural(overCount, m.budgets_envelopes_one, m.budgets_envelopes)}
						</dd>
					</div>
				</dl>
			</section>

			<section class="card">
				<h2 class="text-title-lg">{m.budgets_distribution()}</h2>
				<p class="text-body-sm text-on-surface-variant">{m.budgets_distribution_intro()}</p>
				<div class="mt-4 flex h-3 overflow-hidden rounded-full bg-surface-container-high">
					{#each BUCKETS as bucket (bucket)}
						<div
							class={bucketBar[bucket]}
							style:width="{permille(buckets[bucket].limitMinor, totalLimit) / 10}%"
						></div>
					{/each}
				</div>
				<ul class="mt-4 space-y-2">
					{#each BUCKETS as bucket (bucket)}
						<li
							class="flex items-center justify-between gap-3 rounded-2xl bg-surface-container-low px-3 py-2"
						>
							<span class="flex min-w-0 items-center gap-2">
								<span class={['size-2.5 shrink-0 rounded-full', bucketBar[bucket]]}></span>
								<span class="truncate text-label-lg">{bucketMeta[bucket].short()}</span>
							</span>
							<span class="text-right">
								<span class="block text-label-lg tabular-nums"
									>{money(buckets[bucket].limitMinor)}</span
								>
								<span class="block text-body-sm text-on-surface-variant tabular-nums"
									>{m.budgets_distribution_row({
										target: BUCKET_TARGET_PCT[bucket],
										actual: Math.round(permille(buckets[bucket].limitMinor, totalLimit) / 10)
									})}</span
								>
							</span>
						</li>
					{/each}
				</ul>
			</section>

			<p class="px-2 text-body-sm text-on-surface-variant">
				{m.budgets_currency_note({ currency })}
			</p>
		</aside>
	</div>
{/if}
