<script lang="ts">
	import IconCalendar from '~icons/material-symbols/event-outline';
	import IconCheck from '~icons/material-symbols/verified-outline';
	import IconGoal from '~icons/material-symbols/savings-outline';
	import IconTrend from '~icons/material-symbols/trending-up';
	import type { Goal } from '@savesphere/contracts';
	import { resolve } from '$app/paths';
	import type { GoalProgress } from '#lib/goals.ts';
	import { formatMoney } from '#lib/money.ts';
	import { m } from '#lib/paraglide/messages.js';

	interface Props {
		goal: Goal;
		progress: GoalProgress;
		locale: string;
	}

	let { goal, progress, locale }: Props = $props();

	const money = (minor: number) => formatMoney(minor, goal.currency, locale);
	const percent = $derived(
		new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 1 }).format(
			progress.permille / 1000
		)
	);
	const due = $derived(
		goal.targetDate
			? new Intl.DateTimeFormat(locale, {
					month: 'short',
					year: 'numeric',
					timeZone: 'UTC'
				}).format(new Date(`${goal.targetDate}T12:00:00Z`))
			: null
	);
	const statusLabels = {
		active: m.goals_status_active,
		paused: m.goals_status_paused,
		achieved: m.goals_status_achieved,
		abandoned: m.goals_status_abandoned
	};
	const muted = $derived(goal.status === 'paused' || goal.status === 'abandoned');
</script>

<article
	data-status={goal.status}
	class={[
		'flex flex-col overflow-hidden rounded-card bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)]',
		muted && 'opacity-75'
	]}
>
	<div class="flex flex-1 flex-col gap-4 p-5">
		<header class="flex items-start justify-between gap-2">
			<span
				class="flex size-11 items-center justify-center rounded-2xl bg-primary-fixed text-primary"
			>
				<IconGoal class="size-6" aria-hidden="true" />
			</span>
			{#if goal.status !== 'active'}
				<span
					class="rounded-full bg-surface-container-high px-2.5 py-1 text-label-sm text-on-surface-variant"
					>{statusLabels[goal.status]()}</span
				>
			{:else if progress.reached}
				<span
					class="inline-flex items-center gap-1 rounded-full bg-surface-container-high px-2.5 py-1 text-label-sm text-on-surface"
					><IconCheck class="size-4 text-tertiary" aria-hidden="true" />{m.goals_reached()}</span
				>
			{:else if progress.overdue}
				<span
					class="rounded-full bg-error-container px-2.5 py-1 text-label-sm text-on-error-container"
					>{m.goals_overdue()}</span
				>
			{:else if due}
				<span
					class="rounded-full bg-primary-fixed px-2.5 py-1 text-label-sm text-on-primary-fixed-variant"
					>{m.goals_due({ date: due })}</span
				>
			{/if}
		</header>
		<h3 class="text-title-lg">{goal.name}</h3>
		<div class="mt-auto space-y-2">
			<p class="flex flex-wrap items-baseline justify-between gap-x-2">
				<span>
					<span class="text-headline-sm font-display tabular-nums">{money(goal.savedMinor)}</span>
					<span class="text-body-sm text-on-surface-variant tabular-nums"
						>{m.goals_of_target({ amount: money(goal.targetMinor) })}</span
					>
				</span>
				<span class="text-label-lg text-primary tabular-nums">{percent}</span>
			</p>
			<div
				class="h-2 overflow-hidden rounded-full bg-surface-container-high"
				role="progressbar"
				aria-label={goal.name}
				aria-valuemin={0}
				aria-valuemax={100}
				aria-valuenow={Math.round(progress.permille / 10)}
			>
				<div
					class={[
						'h-full rounded-full transition-[width] duration-700',
						progress.reached ? 'bg-tertiary' : 'bg-primary-container'
					]}
					style:width="{progress.permille / 10}%"
				></div>
			</div>
		</div>
	</div>
	<footer
		class="flex items-center justify-between gap-3 border-t border-outline-variant/30 bg-surface-container-low/60 px-5 py-3 text-body-sm"
	>
		<span class="flex min-w-0 items-center gap-1.5 text-on-surface-variant">
			{#if goal.status === 'active' && progress.monthlyMinor}
				<IconTrend class="size-4 shrink-0" aria-hidden="true" />
				<span class="truncate tabular-nums"
					>{m.goals_per_month_short({ amount: money(progress.monthlyMinor) })}</span
				>
			{:else if !goal.targetDate}
				<IconCalendar class="size-4 shrink-0" aria-hidden="true" />
				<span class="truncate">{m.goals_no_date()}</span>
			{/if}
		</span>
		<a
			href={resolve('/(app)/goals/[id]', { id: goal.id })}
			aria-label={m.goals_manage_label({ name: goal.name })}
			class="shrink-0 rounded-full bg-surface-container-high px-3 py-1.5 text-label-lg text-on-surface transition hover:bg-primary-fixed"
			>{m.goals_manage()}</a
		>
	</footer>
</article>
