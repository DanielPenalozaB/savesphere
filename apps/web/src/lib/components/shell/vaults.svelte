<script lang="ts">
	import type { Goal } from '@savesphere/contracts';
	import IconAdd from '~icons/material-symbols/add-circle-outline';
	import { resolve } from '$app/paths';
	import { m } from '#lib/paraglide/messages.js';

	/** The design's "Bóvedas activas": active savings goals with their progress. */
	let { goals, onnavigate }: { goals: Goal[]; onnavigate?: () => void } = $props();

	const percent = (goal: Goal) =>
		Math.max(0, Math.min(100, Math.floor((goal.savedMinor / goal.targetMinor) * 100)));
	// Alternates the design's two accent colours.
	const accents = ['bg-primary-container', 'bg-tertiary-container'];
</script>

<section class="space-y-2" aria-labelledby="vaults-title">
	<div class="flex items-center justify-between px-2">
		<h2
			id="vaults-title"
			class="font-sans text-label-sm tracking-wider text-on-surface-variant uppercase"
		>
			{m.sidebar_vaults()}
		</h2>
		<a
			href={resolve('goals/new')}
			onclick={onnavigate}
			aria-label={m.sidebar_add_vault()}
			title={m.sidebar_add_vault()}
			class="text-primary transition-colors hover:text-on-primary-fixed-variant"
		>
			<IconAdd class="size-[18px]" aria-hidden="true" />
		</a>
	</div>
	{#if goals.length === 0}
		<p class="px-2 text-body-sm text-on-surface-variant">{m.sidebar_vaults_empty()}</p>
	{:else}
		<ul class="space-y-1">
			{#each goals as goal, index (goal.id)}
				{@const value = percent(goal)}
				<li class="rounded-2xl bg-surface-container-lowest p-2 shadow-sm">
					<div class="mb-1 flex items-center justify-between gap-2">
						<span class="flex min-w-0 items-center gap-1 text-label-md text-on-surface">
							<span class={['inline-block size-2 shrink-0 rounded-full', accents[index % 2]]}
							></span>
							<span class="truncate">{goal.name}</span>
						</span>
						<span class="text-label-sm text-on-surface-variant">{value}%</span>
					</div>
					<div
						class="h-1.5 w-full overflow-hidden rounded-full bg-surface-container-high"
						role="progressbar"
						aria-label={goal.name}
						aria-valuenow={value}
						aria-valuemin={0}
						aria-valuemax={100}
					>
						<div class={['h-full rounded-full', accents[index % 2]]} style:width="{value}%"></div>
					</div>
				</li>
			{/each}
		</ul>
	{/if}
</section>
