<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';

	/** `compact` shows only the logo (collapsed sidebar). */
	let { compact = false }: { compact?: boolean } = $props();
</script>

<div class="flex items-center gap-2">
	<img src="/logo.svg" alt={compact ? m.app_name() : ''} class="size-10 rounded-full shadow-sm" />
	{#if !compact}
		<div class="leading-none">
			<span class="block font-display text-title-sm tracking-tight">{m.app_name()}</span>
			<span class="text-label-sm tracking-wider text-primary uppercase">{m.brand_label()}</span>
		</div>
	{/if}
</div>
