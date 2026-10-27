<script lang="ts">
	import IconArrow from '~icons/material-symbols/arrow-forward';
	import Spinner from '#lib/components/spinner.svelte';

	let { label, busy }: { label: string; busy: boolean } = $props();
</script>

<button
	type="submit"
	disabled={busy}
	aria-busy={busy}
	class="flex w-full items-center justify-center gap-2 rounded-full bg-primary-container px-6 py-3 text-title-sm text-on-primary shadow-lg shadow-primary-container/25 transition hover:brightness-105 disabled:opacity-60"
>
	{label}
	{#if busy}<Spinner />{:else}<IconArrow class="size-5" aria-hidden="true" />{/if}
</button>
