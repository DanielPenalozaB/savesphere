<script lang="ts">
	import IconAdd from '~icons/material-symbols/add';
	import { resolve } from '$app/paths';
	import { m } from '#lib/paraglide/messages.js';
	import { quickAdd } from '#lib/quick-add.svelte.ts';

	let { short = false, class: className = '' }: { short?: boolean; class?: string } = $props();
</script>

<!-- A link, so it works before hydration (full-page form); with JS it opens the sheet instead. -->
<a
	href={resolve('activity/new')}
	onclick={(event) => {
		event.preventDefault();
		quickAdd.open = true;
	}}
	class={[
		'inline-flex items-center justify-center gap-2 rounded-full bg-primary-container px-5 py-2.5 text-label-lg text-on-primary shadow-lg shadow-primary-container/25 transition hover:brightness-105',
		className
	]}
>
	<IconAdd class="size-5" aria-hidden="true" />
	{short ? m.record_movement_short() : m.record_movement()}
</a>
