<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	import { cn, type WithElementRef } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		children,
		tag = "div",
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		tag?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "div";
	} = $props();
</script>

<svelte:element
	this={tag}
	bind:this={ref}
	data-slot="card-title"
	class={cn("text-base leading-snug font-medium group-data-[size=sm]/card:text-sm", className)}
	{...restProps}
>
	{@render children?.()}
</svelte:element>
