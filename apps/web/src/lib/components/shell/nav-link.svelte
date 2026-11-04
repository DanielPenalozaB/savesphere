<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { isActive, type NavItem } from '#lib/navigation.ts';

	interface Props {
		item: NavItem;
		/** Icon only, with the label as tooltip and accessible name (collapsed sidebar). */
		compact?: boolean;
		onnavigate?: () => void;
	}

	let { item, compact = false, onnavigate }: Props = $props();
	const active = $derived(isActive(item.href, page.url.pathname));
</script>

<a
	href={resolve(item.href)}
	aria-current={active ? 'page' : undefined}
	aria-label={compact ? item.label() : undefined}
	title={compact ? item.label() : undefined}
	onclick={onnavigate}
	class={[
		'flex items-center gap-2 rounded-full py-2 text-label-lg transition-all',
		compact ? 'justify-center px-2' : 'px-4',
		active
			? 'bg-primary-container font-bold text-on-primary shadow-sm'
			: 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
	]}
>
	<item.icon class="size-5 shrink-0" aria-hidden="true" />
	{#if !compact}<span>{item.label()}</span>{/if}
</a>
