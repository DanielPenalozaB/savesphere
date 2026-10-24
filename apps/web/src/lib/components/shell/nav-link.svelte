<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { isActive, type NavItem } from '#lib/navigation.ts';

	let { item, onnavigate }: { item: NavItem; onnavigate?: () => void } = $props();
	const active = $derived(isActive(item.href, page.url.pathname));
</script>

<a
	href={resolve(item.href)}
	aria-current={active ? 'page' : undefined}
	onclick={onnavigate}
	class={[
		'flex items-center gap-2 rounded-full px-4 py-2 text-label-lg transition-colors',
		active
			? 'bg-primary-container font-bold text-on-primary shadow-sm'
			: 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
	]}
>
	<item.icon class="size-5 shrink-0" aria-hidden="true" />
	<span>{item.label()}</span>
</a>
