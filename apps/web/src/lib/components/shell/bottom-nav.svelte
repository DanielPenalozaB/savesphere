<script lang="ts">
	import IconMore from '~icons/material-symbols/more-horiz';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { m } from '#lib/paraglide/messages.js';
	import { bottomNav, isActive } from '#lib/navigation.ts';

	let { onmore }: { onmore: () => void } = $props();
</script>

<nav
	aria-label={m.nav_label()}
	class="fixed inset-x-0 bottom-0 z-40 border-t border-surface-container-high bg-surface/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
>
	<ul class="grid grid-cols-5">
		{#each bottomNav as item (item.href)}
			{@const active = isActive(item.href, page.url.pathname)}
			<li>
				<a
					href={resolve(item.href)}
					aria-current={active ? 'page' : undefined}
					class={[
						'flex flex-col items-center gap-0.5 py-2 text-[0.625rem] leading-tight font-semibold',
						active ? 'text-primary' : 'text-on-surface-variant'
					]}
				>
					<span
						class={['rounded-full px-4 py-0.5 transition-colors', active && 'bg-primary-fixed']}
					>
						<item.icon class="size-6" aria-hidden="true" />
					</span>
					<span class="max-w-full truncate px-0.5">{(item.shortLabel ?? item.label)()}</span>
				</a>
			</li>
		{/each}
		<li>
			<button
				type="button"
				onclick={onmore}
				class="flex w-full flex-col items-center gap-0.5 py-2 text-[0.625rem] leading-tight font-semibold text-on-surface-variant"
			>
				<span class="rounded-full px-4 py-0.5"><IconMore class="size-6" aria-hidden="true" /></span>
				<span>{m.nav_more()}</span>
			</button>
		</li>
	</ul>
</nav>
