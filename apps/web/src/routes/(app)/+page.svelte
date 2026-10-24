<script lang="ts">
	import IconActivity from '~icons/material-symbols/receipt-long-outline';
	import PageHeader from '#lib/components/page-header.svelte';
	import { m } from '#lib/paraglide/messages.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const firstName = $derived(data.user.name.split(' ')[0] ?? data.user.name);
</script>

<svelte:head>
	<title>{m.nav_home()} · {m.app_name()}</title>
</svelte:head>

<PageHeader title={m.home_greeting({ name: firstName })} intro={m.home_intro()} />

<div class="flex flex-col items-center gap-3 card py-12 text-center">
	<span class="flex size-14 items-center justify-center rounded-full bg-primary-fixed text-primary">
		<IconActivity class="size-7" aria-hidden="true" />
	</span>
	<h2 class="text-headline-md">{m.coming_soon_title()}</h2>
	<p class="max-w-sm text-on-surface-variant">{m.coming_soon_body()}</p>
</div>
