<script lang="ts">
	import type { Component, Snippet } from 'svelte';
	import type { HTMLInputAttributes, SVGAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLInputAttributes, 'value'> {
		label: string;
		value: string;
		hint?: string;
		icon?: Component<SVGAttributes<SVGSVGElement>>;
		/** Rendered inside the field on the right, e.g. a show/hide toggle. */
		trailing?: Snippet;
	}

	let {
		label,
		value = $bindable(),
		hint,
		icon: Icon,
		trailing,
		id: idProp,
		...rest
	}: Props = $props();
	// Stable across SSR and hydration, unlike a random id.
	const uid = $props.id();
	const id = $derived(idProp ?? uid);
</script>

<div class="space-y-1">
	<label for={id} class="block text-label-lg text-on-surface">{label}</label>
	<div class="relative flex items-center">
		{#if Icon}
			<Icon
				class="pointer-events-none absolute left-4 size-5 text-on-surface-variant"
				aria-hidden="true"
			/>
		{/if}
		<input
			{id}
			bind:value
			aria-describedby={hint ? `${id}-hint` : undefined}
			class={[
				'w-full rounded-full border-0 bg-surface-container-low py-3 text-body-lg text-on-surface placeholder:text-on-surface-variant/70 focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary-container',
				Icon ? 'pl-12' : 'pl-4',
				trailing ? 'pr-12' : 'pr-4'
			]}
			{...rest}
		/>
		{#if trailing}
			<div class="absolute right-2">{@render trailing()}</div>
		{/if}
	</div>
	{#if hint}<p id="{id}-hint" class="px-4 text-body-sm text-on-surface-variant">{hint}</p>{/if}
</div>
