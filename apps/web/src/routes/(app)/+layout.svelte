<script lang="ts">
	import IconClose from '~icons/material-symbols/close';
	import IconMenu from '~icons/material-symbols/menu';
	import { afterNavigate } from '$app/navigation';
	import BottomNav from '#lib/components/shell/bottom-nav.svelte';
	import Brand from '#lib/components/shell/brand.svelte';
	import Sidebar from '#lib/components/shell/sidebar.svelte';
	import UserMenu from '#lib/components/shell/user-menu.svelte';
	import { m } from '#lib/paraglide/messages.js';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();
	let drawer: HTMLDialogElement;

	afterNavigate(() => drawer?.close());
</script>

<!-- Desktop: fixed sidebar. Mobile: top bar + bottom navigation + "More" drawer. -->
<aside
	class="fixed inset-y-0 left-0 z-40 hidden w-72 bg-surface-container-low shadow-[0_1px_8px_rgba(0,0,0,0.04)] lg:block"
>
	<Sidebar />
</aside>

<dialog
	bind:this={drawer}
	aria-label={m.nav_label()}
	class="m-0 h-dvh max-h-none w-72 max-w-[85vw] bg-surface-container-low backdrop:bg-inverse-surface/40 lg:hidden"
>
	<button
		type="button"
		onclick={() => drawer.close()}
		aria-label={m.nav_close_menu()}
		class="absolute top-6 right-4 flex size-9 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container"
	>
		<IconClose class="size-5" aria-hidden="true" />
	</button>
	<Sidebar onnavigate={() => drawer.close()} />
</dialog>

<div class="lg:pl-72">
	<header
		class="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 bg-surface/85 px-4 shadow-[0_1px_8px_rgba(0,0,0,0.04)] backdrop-blur-xl md:px-6"
	>
		<div class="flex items-center gap-2 lg:hidden">
			<button
				type="button"
				onclick={() => drawer.showModal()}
				aria-label={m.nav_open_menu()}
				class="flex size-9 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-low"
			>
				<IconMenu class="size-6" aria-hidden="true" />
			</button>
			<Brand />
		</div>
		<div class="ml-auto"><UserMenu user={data.user} /></div>
	</header>

	<main class="mx-auto w-full max-w-7xl px-4 pt-6 pb-28 md:px-6 lg:px-10 lg:pb-10">
		{@render children()}
	</main>
</div>

<BottomNav onmore={() => drawer.showModal()} />
