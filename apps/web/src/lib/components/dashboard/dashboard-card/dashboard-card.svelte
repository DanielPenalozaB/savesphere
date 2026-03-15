<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils';

	let {
		children,
		class: className,
		...rest
	}: HTMLAttributes<HTMLDivElement> & { children?: Snippet } = $props();
</script>

<div
	class={cn(
		'flex flex-col rounded-md border border-white/5 bg-slate-100 shadow-xs dark:bg-slate-900',
		className
	)}
	{...rest}
>
	{@render children?.()}
</div>
