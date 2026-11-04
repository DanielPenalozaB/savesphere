<script lang="ts">
	import type { Account, Category } from '@savesphere/contracts';
	import IconClose from '~icons/material-symbols/close';
	import { invalidateAll } from '$app/navigation';
	import { zonedDate } from '#lib/dates.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { quickAdd } from '#lib/quick-add.svelte.ts';
	import { toast } from '#lib/toast.svelte.ts';
	import TransactionForm from './transaction-form.svelte';

	let {
		accounts,
		categories,
		timeZone
	}: { accounts: Account[]; categories: Category[]; timeZone: string } = $props();

	let dialog: HTMLDialogElement;
	// A fresh idempotency key per opening: retries of the same submit never duplicate it.
	let clientRef = $state('');
	// Stays true after the first opening, so the form remains visible while the sheet animates out.
	let rendered = $state(false);

	$effect(() => {
		if (quickAdd.open && !dialog.open) {
			clientRef = crypto.randomUUID();
			rendered = true;
			dialog.showModal();
		} else if (!quickAdd.open && dialog.open) {
			dialog.close();
		}
	});
</script>

<!-- Bottom sheet on phones, centred modal on larger screens. -->
<dialog
	bind:this={dialog}
	onclose={() => (quickAdd.open = false)}
	aria-labelledby="quick-add-title"
	class="sheet mx-auto mt-auto mb-0 max-h-[92dvh] w-full max-w-none overflow-y-auto rounded-t-[2rem] bg-surface-container-lowest p-6 shadow-2xl backdrop:bg-inverse-surface/40 sm:my-auto sm:max-w-xl sm:rounded-card"
>
	<header class="mb-5 flex items-center justify-between">
		<h2 id="quick-add-title" class="text-headline-md">{m.tx_form_title()}</h2>
		<button
			type="button"
			onclick={() => (quickAdd.open = false)}
			aria-label={m.tx_cancel()}
			class="flex size-9 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-low"
		>
			<IconClose class="size-5" aria-hidden="true" />
		</button>
	</header>
	{#if rendered}
		{#key clientRef}
			<TransactionForm
				{accounts}
				{categories}
				{clientRef}
				today={zonedDate(new Date(), timeZone)}
				onsaved={async () => {
					quickAdd.open = false;
					toast(m.tx_saved());
					await invalidateAll();
				}}
				oncancel={() => (quickAdd.open = false)}
			/>
		{/key}
	{/if}
</dialog>
