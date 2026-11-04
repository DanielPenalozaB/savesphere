<script lang="ts">
	import IconCheck from '~icons/material-symbols/check-circle-outline';
	import { fly } from 'svelte/transition';
	import { dismiss, toasts } from '#lib/toast.svelte.ts';
</script>

<!-- Above the phone tab bar; bottom-centre on desktop. -->
<div
	aria-live="polite"
	class="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex flex-col items-center gap-2 px-4 lg:bottom-6"
>
	{#each toasts as item (item.id)}
		<button
			type="button"
			onclick={() => dismiss(item.id)}
			transition:fly={{ y: 16, duration: 200 }}
			class="pointer-events-auto flex items-center gap-2 rounded-full bg-inverse-surface py-3 pr-5 pl-4 text-label-lg text-inverse-on-surface shadow-xl"
		>
			<IconCheck class="size-5 text-primary-container" aria-hidden="true" />
			{item.message}
		</button>
	{/each}
</div>
