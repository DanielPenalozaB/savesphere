<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils';

	let {
		children,
		class: className,
		...rest
	}: HTMLAttributes<HTMLSpanElement> & { children?: Snippet } = $props();
</script>

<span class={cn('text-sm text-slate-400', className)} {...rest}>
	{@render children?.()}
</span>
