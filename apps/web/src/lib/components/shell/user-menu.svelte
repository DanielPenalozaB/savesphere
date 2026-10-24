<script lang="ts">
	import IconLogout from '~icons/material-symbols/logout';
	import IconPerson from '~icons/material-symbols/person-outline';
	import { resolve } from '$app/paths';
	import type { SessionUser } from '#lib/auth/user.ts';
	import { m } from '#lib/paraglide/messages.js';

	let { user }: { user: SessionUser } = $props();
</script>

<details class="relative">
	<summary
		class="flex cursor-pointer list-none items-center gap-2 rounded-full p-1 hover:bg-surface-container-low [&::-webkit-details-marker]:hidden"
		aria-label={m.account_menu()}
	>
		<span class="flex size-8 items-center justify-center rounded-full bg-primary text-on-primary">
			<IconPerson class="size-5" aria-hidden="true" />
		</span>
		<span class="hidden text-left lg:block">
			<span class="block text-label-md leading-tight">{user.name}</span>
			<span class="block text-body-sm leading-tight text-on-surface-variant">{user.email}</span>
		</span>
	</summary>
	<div
		class="absolute right-0 z-50 mt-2 w-56 rounded-2xl bg-surface-container-lowest p-2 shadow-lg ring-1 ring-surface-container-high"
	>
		<p class="truncate px-3 py-2 text-body-sm text-on-surface-variant lg:hidden">{user.email}</p>
		<form method="POST" action={resolve('logout')}>
			<button
				type="submit"
				class="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-label-lg text-on-surface hover:bg-surface-container-low"
			>
				<IconLogout class="size-5" aria-hidden="true" />
				{m.sign_out()}
			</button>
		</form>
	</div>
</details>
