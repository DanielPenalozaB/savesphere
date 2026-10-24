<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
</script>

<div class="flex items-center gap-2">
	<img src="/logo.svg" alt="" class="size-10 rounded-full shadow-sm" />
	<div class="leading-none">
		<span class="block font-display text-title-sm tracking-tight">{m.app_name()}</span>
		<span class="text-label-sm tracking-wider text-primary uppercase">{m.brand_label()}</span>
	</div>
</div>
