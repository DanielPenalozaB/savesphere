<script lang="ts">
	import IconAdd from '~icons/material-symbols/add';
	import IconMore from '~icons/material-symbols/more-horiz';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { m } from '#lib/paraglide/messages.js';
	import { bottomNavEnd, bottomNavStart, isActive, type NavItem } from '#lib/navigation.ts';
	import { quickAdd } from '#lib/quick-add.svelte.ts';

	let { onmore }: { onmore: () => void } = $props();
	const tab = 'flex flex-col items-center gap-0.5 py-2 text-[0.625rem] leading-tight font-semibold';
</script>

{#snippet link(item: NavItem)}
	{@const active = isActive(item.href, page.url.pathname)}
	<li>
		<a
			href={resolve(item.href)}
			aria-current={active ? 'page' : undefined}
			class={[tab, active ? 'text-primary' : 'text-on-surface-variant']}
		>
			<span class={['rounded-full px-4 py-0.5 transition-colors', active && 'bg-primary-fixed']}>
				<item.icon class="size-6" aria-hidden="true" />
			</span>
			<span class="max-w-full truncate px-0.5">{(item.shortLabel ?? item.label)()}</span>
		</a>
	</li>
{/snippet}

<nav
	aria-label={m.nav_label()}
	class="fixed inset-x-0 bottom-0 z-40 border-t border-surface-container-high bg-surface/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
>
	<ul class="grid grid-cols-5 items-end">
		{#each bottomNavStart as item (item.href)}{@render link(item)}{/each}
		<li class="flex justify-center">
			<!-- The design's main action, raised above the bar. Works as a link before hydration. -->
			<a
				href={resolve('activity/new')}
				onclick={(event) => {
					event.preventDefault();
					quickAdd.open = true;
				}}
				aria-label={m.record_movement()}
				class="-mt-6 mb-2 flex size-14 items-center justify-center rounded-full bg-primary-container text-on-primary shadow-lg ring-4 shadow-primary-container/40 ring-surface"
			>
				<IconAdd class="size-7" aria-hidden="true" />
			</a>
		</li>
		{#each bottomNavEnd as item (item.href)}{@render link(item)}{/each}
		<li>
			<button type="button" onclick={onmore} class={['w-full text-on-surface-variant', tab]}>
				<span class="rounded-full px-4 py-0.5"><IconMore class="size-6" aria-hidden="true" /></span>
				<span>{m.nav_more()}</span>
			</button>
		</li>
	</ul>
</nav>
