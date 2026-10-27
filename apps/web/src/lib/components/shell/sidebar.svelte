<script lang="ts">
	import type { Goal } from '@savesphere/contracts';
	import IconCollapse from '~icons/material-symbols/left-panel-close-outline';
	import IconExpand from '~icons/material-symbols/left-panel-open-outline';
	import { m } from '#lib/paraglide/messages.js';
	import { mainNav, settingsNav } from '#lib/navigation.ts';
	import Brand from './brand.svelte';
	import NavLink from './nav-link.svelte';
	import Vaults from './vaults.svelte';

	interface Props {
		goals: Goal[];
		/** Icon-only rail (desktop). */
		collapsed?: boolean;
		/** Shows the collapse/expand button (desktop only; the drawer has its own close button). */
		ontoggle?: () => void;
		/** Called after a link is followed, so the mobile drawer can close itself. */
		onnavigate?: () => void;
	}

	let { goals, collapsed = false, ontoggle, onnavigate }: Props = $props();
</script>

<!-- Mirrors the Stitch "Panel" sidebar: brand, main navigation, active vaults, settings. -->
<div class="flex h-full flex-col py-6">
	<div
		class={['mb-6 flex items-center', collapsed ? 'flex-col gap-3 px-2' : 'justify-between px-6']}
	>
		<Brand compact={collapsed} />
		{#if ontoggle}
			<button
				type="button"
				onclick={ontoggle}
				aria-label={collapsed ? m.sidebar_expand() : m.sidebar_collapse()}
				aria-expanded={!collapsed}
				title={collapsed ? m.sidebar_expand() : m.sidebar_collapse()}
				class="flex size-8 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
			>
				{#if collapsed}<IconExpand class="size-5" aria-hidden="true" />{:else}<IconCollapse
						class="size-5"
						aria-hidden="true"
					/>{/if}
			</button>
		{/if}
	</div>

	<div class={['flex-1 space-y-6 overflow-y-auto', collapsed ? 'px-3' : 'px-4']}>
		<div class="space-y-1">
			{#if !collapsed}
				<p class="px-2 pb-1 text-label-sm tracking-wider text-on-surface-variant uppercase">
					{m.nav_section_main()}
				</p>
			{/if}
			<nav aria-label={m.nav_label()} class="space-y-1">
				{#each mainNav as item (item.href)}
					<NavLink {item} compact={collapsed} {onnavigate} />
				{/each}
			</nav>
		</div>
		{#if !collapsed}<Vaults {goals} {onnavigate} />{/if}
	</div>

	<div class={['pt-2', collapsed ? 'px-3' : 'px-4']}>
		<NavLink item={settingsNav} compact={collapsed} {onnavigate} />
	</div>
</div>
