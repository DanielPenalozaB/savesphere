<script lang="ts">
	import { minorUnitOf, type Category } from '@savesphere/contracts';
	import type { EnvelopeView } from '#lib/budgets.ts';
	import { categoryIcon, categoryLabel } from '#lib/categories.ts';
	import { formatMoney } from '#lib/money.ts';
	import { m } from '#lib/paraglide/messages.js';

	interface Props {
		envelope: EnvelopeView;
		category: Pick<Category, 'name' | 'icon'> | undefined;
		currency: string;
		locale: string;
	}

	let { envelope, category, currency, locale }: Props = $props();

	const Icon = $derived(categoryIcon(category?.icon ?? null));
	const name = $derived(category ? categoryLabel(category) : '—');
	const money = (minor: number) => formatMoney(minor, currency, locale);
	// Whole currency units per day ("$ 6.666/día"), like the Panel's daily average.
	const perDay = $derived.by(() => {
		const unit = 10 ** minorUnitOf(currency);
		return Math.floor(envelope.dailyAllowanceMinor / unit) * unit;
	});
	const percent = (permille: number) =>
		new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 1 }).format(
			permille / 1000
		);
	const bar = $derived(Math.min(100, envelope.usedPermille / 10));
	const chip = $derived(
		envelope.state === 'over'
			? m.budgets_state_over({ percent: percent(envelope.usedPermille - 1000) })
			: percent(envelope.usedPermille)
	);
</script>

<article
	data-state={envelope.state}
	class={[
		'flex flex-col gap-3 rounded-[1.5rem] p-4',
		envelope.state === 'over' ? 'bg-error-container/40' : 'bg-surface-container-low'
	]}
>
	<header class="flex items-start justify-between gap-2">
		<h4 class="flex min-w-0 items-center gap-2 text-title-sm">
			<Icon class="size-5 shrink-0 text-on-surface-variant" aria-hidden="true" />
			<span class="truncate">{name}</span>
		</h4>
		<span
			class={[
				'shrink-0 rounded-full px-2 py-0.5 text-label-sm tabular-nums',
				envelope.state === 'over' && 'bg-error text-on-error',
				envelope.state === 'warning' && 'bg-primary-fixed text-on-primary-fixed-variant',
				envelope.state === 'ok' && 'bg-surface-container-high text-on-surface-variant'
			]}>{chip}</span
		>
	</header>
	<p class="flex flex-wrap items-baseline gap-x-1">
		<span class="text-title-lg font-display tabular-nums">{money(envelope.spentMinor)}</span>
		<span class="text-body-sm text-on-surface-variant tabular-nums"
			>{m.budgets_limit_of({ limit: money(envelope.limitMinor) })}</span
		>
	</p>
	<div
		class="h-2 overflow-hidden rounded-full bg-surface-container-highest"
		role="progressbar"
		aria-label={name}
		aria-valuemin={0}
		aria-valuemax={100}
		aria-valuenow={Math.round(bar)}
	>
		<div
			class={[
				'h-full rounded-full transition-[width] duration-700',
				envelope.state === 'over'
					? 'bg-error'
					: envelope.state === 'warning'
						? 'bg-primary-container'
						: 'bg-inverse-surface'
			]}
			style:width="{bar}%"
		></div>
	</div>
	<footer class="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-body-sm">
		{#if envelope.state === 'warning' && envelope.remainingMinor > 0}
			<span class="text-on-surface-variant">{m.budgets_state_warning()}</span>
		{:else if envelope.remainingMinor > 0}
			<span class="text-on-surface-variant tabular-nums"
				>{(envelope.onPace ? m.budgets_on_pace : m.budgets_off_pace)({
					amount: money(perDay)
				})}</span
			>
		{:else}
			<span></span>
		{/if}
		{#if envelope.remainingMinor >= 0}
			<span class="font-medium text-tertiary tabular-nums"
				>{m.budgets_left({ amount: money(envelope.remainingMinor) })}</span
			>
		{:else}
			<span class="font-medium text-error tabular-nums"
				>{m.budgets_over({ amount: money(-envelope.remainingMinor) })}</span
			>
		{/if}
	</footer>
</article>
