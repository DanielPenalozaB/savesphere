<script lang="ts">
	import IconClose from '~icons/material-symbols/close';
	import IconMenu from '~icons/material-symbols/menu';
	import IconPayments from '~icons/material-symbols/payments-outline';
	import { afterNavigate } from '$app/navigation';
	import QuickAddSheet from '#lib/components/ledger/quick-add-sheet.svelte';
	import BottomNav from '#lib/components/shell/bottom-nav.svelte';
	import Brand from '#lib/components/shell/brand.svelte';
	import Sidebar from '#lib/components/shell/sidebar.svelte';
	import UserMenu from '#lib/components/shell/user-menu.svelte';
	import Toaster from '#lib/components/toaster.svelte';
	import { m } from '#lib/paraglide/messages.js';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();
	let drawer: HTMLDialogElement;
	// svelte-ignore state_referenced_locally
	let collapsed = $state(data.sidebarCollapsed);

	function toggleSidebar() {
		collapsed = !collapsed;
		// A cookie (not localStorage) so the server renders the right width: no layout jump.
		document.cookie = `sidebar=${collapsed ? 'collapsed' : 'expanded'}; path=/; max-age=31536000; samesite=lax`;
	}

	afterNavigate(() => drawer?.close());
</script>

<!-- Desktop: fixed sidebar. Mobile: top bar + bottom navigation + "More" drawer. -->
<aside
	class={[
		'fixed inset-y-0 left-0 z-40 hidden bg-surface-container-low shadow-[0_1px_8px_rgba(0,0,0,0.04)] transition-[width] lg:block',
		collapsed ? 'w-20' : 'w-72'
	]}
>
	<Sidebar goals={data.goals} {collapsed} ontoggle={toggleSidebar} />
</aside>

<dialog
	bind:this={drawer}
	aria-label={m.nav_label()}
	class="drawer m-0 h-dvh max-h-none w-72 max-w-[85vw] bg-surface-container-low backdrop:bg-inverse-surface/40 lg:hidden"
>
	<button
		type="button"
		onclick={() => drawer.close()}
		aria-label={m.nav_close_menu()}
		class="absolute top-6 right-4 flex size-9 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container"
	>
		<IconClose class="size-5" aria-hidden="true" />
	</button>
	<Sidebar goals={data.goals} onnavigate={() => drawer.close()} />
</dialog>

<div class={['transition-[padding]', collapsed ? 'lg:pl-20' : 'lg:pl-72']}>
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
		<div class="ml-auto flex items-center gap-4">
			<!-- The design's currency chip: the currency the dashboard reports in. -->
			<span
				class="hidden items-center gap-1 rounded-full bg-surface-container px-3 py-1 text-label-sm text-on-surface-variant md:flex"
				title={m.home_currency_chip({ currency: data.settings.baseCurrency })}
			>
				<IconPayments class="size-4 text-primary" aria-hidden="true" />
				{data.settings.baseCurrency} ($)
			</span>
			<span class="hidden h-6 w-px bg-surface-container-highest md:block"></span>
			<UserMenu user={data.user} />
		</div>
	</header>

	<main class="mx-auto w-full max-w-7xl px-4 pt-6 pb-28 md:px-6 lg:px-10 lg:pb-10">
		{@render children()}
	</main>
</div>

<BottomNav onmore={() => drawer.showModal()} />
<Toaster />
<QuickAddSheet
	accounts={data.accounts}
	categories={data.categories}
	timeZone={data.settings.timezone}
/>
