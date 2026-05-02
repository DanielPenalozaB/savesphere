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
		'flex flex-col gap-2 rounded-t-md bg-slate-50 bg-linear-to-br from-white to-slate-100 p-4 dark:from-slate-800 dark:to-slate-900',
		className
	)}
	{...rest}
>
	{@render children?.()}
</div>
