<script lang="ts">
	import type { Goal } from '@savesphere/contracts';
	import IconAdd from '~icons/material-symbols/add';
	import { resolve } from '$app/paths';
	import { formatMoney } from '#lib/money.ts';
	import { m } from '#lib/paraglide/messages.js';

	/** The design's "Metas y Bóvedas": a progress ring per active goal. */
	let { goals, locale }: { goals: Goal[]; locale: string } = $props();

	const percent = (goal: Goal) =>
		Math.max(0, Math.min(100, Math.floor((goal.savedMinor / goal.targetMinor) * 100)));
	const rings = ['text-primary-container', 'text-primary', 'text-tertiary-container'];
	const circumference = 2 * Math.PI * 20;
	const compact = (minor: number, currency: string) =>
		formatMoney(minor, currency, locale, {}).replace(/\s/g, ' ');
</script>

<section class="flex flex-col card">
	<header class="mb-4 flex items-start justify-between gap-2">
		<div>
			<h2 class="text-headline-md">{m.home_goals()}</h2>
			<p class="text-body-sm text-on-surface-variant">{m.home_goals_intro()}</p>
		</div>
		<a
			href={resolve('goals/new')}
			aria-label={m.sidebar_add_vault()}
			title={m.sidebar_add_vault()}
			class="flex size-9 items-center justify-center rounded-full text-primary transition-colors hover:bg-primary-fixed"
		>
			<IconAdd class="size-6" aria-hidden="true" />
		</a>
	</header>
	{#if goals.length === 0}
		<div class="flex flex-1 flex-col items-start justify-center gap-3">
			<p class="text-body-md text-on-surface-variant">{m.sidebar_vaults_empty()}</p>
			<a
				href={resolve('goals/new')}
				class="rounded-full bg-primary-fixed px-4 py-2 text-label-lg text-on-primary-fixed-variant transition hover:brightness-95"
				>{m.goal_save()}</a
			>
		</div>
	{:else}
		<ul class="space-y-4">
			{#each goals.slice(0, 3) as goal, index (goal.id)}
				{@const value = percent(goal)}
				<li class="flex items-center gap-3">
					<svg viewBox="0 0 48 48" class="size-14 shrink-0 -rotate-90" aria-hidden="true">
						<circle
							cx="24"
							cy="24"
							r="20"
							fill="none"
							stroke-width="5"
							class="stroke-surface-container-high"
						/>
						<circle
							cx="24"
							cy="24"
							r="20"
							fill="none"
							stroke="currentColor"
							stroke-width="5"
							stroke-linecap="round"
							stroke-dasharray={circumference}
							stroke-dashoffset={circumference * (1 - value / 100)}
							class={['transition-[stroke-dashoffset] duration-700', rings[index % rings.length]]}
						/>
						<text
							x="24"
							y="24"
							text-anchor="middle"
							dominant-baseline="central"
							transform="rotate(90 24 24)"
							class="fill-on-surface text-[10px] font-bold">{value}%</text
						>
					</svg>
					<div class="min-w-0">
						<p class="truncate text-label-lg">{goal.name}</p>
						<p class="text-body-sm text-on-surface-variant tabular-nums">
							{compact(goal.savedMinor, goal.currency)} / {compact(goal.targetMinor, goal.currency)}
						</p>
					</div>
				</li>
			{/each}
		</ul>
	{/if}
</section>
