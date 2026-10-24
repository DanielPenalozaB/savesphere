<script lang="ts">
	import IconCheck from '~icons/material-symbols/check-circle-outline';
	import Brand from '#lib/components/shell/brand.svelte';
	import { m } from '#lib/paraglide/messages.js';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
	const points = [m.auth_panel_point_track, m.auth_panel_point_budget, m.auth_panel_point_ai];
</script>

<div class="mx-auto flex min-h-dvh max-w-6xl flex-col px-4 py-6 md:px-6">
	<header class="mb-8"><Brand /></header>
	<div
		class="grid flex-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:items-center"
	>
		<section class="mx-auto w-full max-w-lg card md:p-10">
			{@render children()}
		</section>
		<!-- Decorative brand panel, styled after the design's dark "projection" card. -->
		<aside
			class="hidden rounded-card bg-inverse-surface p-10 text-inverse-on-surface shadow-xl lg:block"
		>
			<p class="text-label-md tracking-wider text-primary-fixed-dim uppercase">
				{m.auth_panel_eyebrow()}
			</p>
			<p class="mt-4 font-display text-headline-xl">{m.auth_panel_title()}</p>
			<ul class="mt-8 space-y-4">
				{#each points as point (point)}
					<li class="flex items-center gap-3 text-body-lg">
						<IconCheck class="size-6 shrink-0 text-primary-container" aria-hidden="true" />
						{point()}
					</li>
				{/each}
			</ul>
		</aside>
	</div>
</div>
