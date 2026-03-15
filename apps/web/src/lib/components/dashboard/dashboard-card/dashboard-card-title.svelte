<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils';

	let {
		children,
		class: className,
		...rest
	}: HTMLAttributes<HTMLHeadingElement> & { children?: Snippet } = $props();
</script>

<h3
	class={cn('text-lg font-bold tracking-tight text-slate-600 dark:text-white', className)}
	{...rest}
>
	{@render children?.()}
</h3>
