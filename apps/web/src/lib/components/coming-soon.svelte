<script lang="ts">
	import type { NavItem } from '#lib/navigation.ts';
	import { m } from '#lib/paraglide/messages.js';
	import PageHeader from './page-header.svelte';

	/** Placeholder for sections that are designed but not built yet. */
	let { section }: { section: NavItem } = $props();
</script>

<svelte:head>
	<title>{section.label()} · {m.app_name()}</title>
</svelte:head>

<PageHeader title={section.label()} />
<div class="flex flex-col items-center gap-3 card py-12 text-center">
	<span class="flex size-14 items-center justify-center rounded-full bg-primary-fixed text-primary">
		<section.icon class="size-7" aria-hidden="true" />
	</span>
	<h2 class="text-headline-md">{m.coming_soon_title()}</h2>
	<p class="max-w-sm text-on-surface-variant">{m.coming_soon_body()}</p>
</div>
