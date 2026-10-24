<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import { mainNav, settingsNav } from '#lib/navigation.ts';
	import Brand from './brand.svelte';
	import NavLink from './nav-link.svelte';

	/** Called after a link is followed, so the mobile drawer can close itself. */
	let { onnavigate }: { onnavigate?: () => void } = $props();
</script>

<div class="flex h-full flex-col gap-6 py-6">
	<div class="px-6"><Brand /></div>
	<nav aria-label={m.nav_label()} class="flex-1 space-y-1 overflow-y-auto px-4">
		<p class="px-2 pb-1 text-label-sm tracking-wider text-on-surface-variant uppercase">
			{m.nav_section_main()}
		</p>
		{#each mainNav as item (item.href)}
			<NavLink {item} {onnavigate} />
		{/each}
	</nav>
	<div class="px-4"><NavLink item={settingsNav} {onnavigate} /></div>
</div>
