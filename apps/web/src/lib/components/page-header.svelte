<script lang="ts">
	import type { Snippet } from 'svelte';

	let { title, intro, children }: { title: string; intro?: string; children?: Snippet } = $props();
</script>

<header class="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
	<div>
		<h1 class="text-headline-lg md:text-headline-xl">{title}</h1>
		{#if intro}<p class="mt-1 max-w-xl text-body-lg text-on-surface-variant">{intro}</p>{/if}
	</div>
	{@render children?.()}
</header>
