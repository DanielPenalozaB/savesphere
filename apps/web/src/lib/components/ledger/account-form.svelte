<script lang="ts">
	import { SUPPORTED_CURRENCIES, type AccountKind } from '@savesphere/contracts';
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import { accountKindLabels } from '#lib/accounts.ts';
	import FormError from '#lib/components/form/form-error.svelte';
	import { m } from '#lib/paraglide/messages.js';
	import Spinner from '#lib/components/spinner.svelte';
	import { toast } from '#lib/toast.svelte.ts';
	import type { AccountFormError } from '#lib/server/account-form.ts';

	interface Props {
		defaultCurrency: string;
		error?: AccountFormError | null;
		/** Called after a successful save instead of navigating. */
		onsaved?: () => void;
	}

	let { defaultCurrency, error = $bindable(null), onsaved }: Props = $props();
	let busy = $state(false);

	const kinds: AccountKind[] = [
		'savings',
		'checking',
		'cash',
		'credit_card',
		'investment',
		'other'
	];
	const errors: Record<AccountFormError, () => string> = {
		name: m.account_error_name,
		amount: m.tx_error_amount,
		duplicate: m.account_error_duplicate,
		generic: m.account_error_generic
	};
	const inputClass =
		'w-full rounded-2xl border-0 bg-surface-container-low px-4 py-3 text-body-lg text-on-surface focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary-container';
</script>

<form
	method="POST"
	action={resolve('accounts/new')}
	class="space-y-4"
	use:enhance={() => {
		busy = true;
		return async ({ result, update }) => {
			busy = false;
			if (result.type === 'redirect') toast(m.account_created());
			if (result.type === 'redirect' && onsaved) return onsaved();
			if (result.type === 'failure') {
				error = (result.data?.error as AccountFormError) ?? 'generic';
				return;
			}
			await update();
		};
	}}
>
	{#if error}<FormError message={errors[error]()} />{/if}
	<label class="block space-y-1">
		<span class="text-label-lg">{m.account_name()}</span>
		<input
			name="name"
			required
			maxlength="80"
			placeholder={m.account_name_placeholder()}
			class={inputClass}
		/>
	</label>
	<div class="grid gap-4 sm:grid-cols-2">
		<label class="block space-y-1">
			<span class="text-label-lg">{m.account_kind()}</span>
			<select name="kind" class={inputClass}>
				{#each kinds as kind (kind)}
					<option value={kind}>{accountKindLabels[kind]()}</option>
				{/each}
			</select>
		</label>
		<label class="block space-y-1">
			<span class="text-label-lg">{m.account_currency()}</span>
			<select name="currency" class={inputClass} value={defaultCurrency}>
				{#each SUPPORTED_CURRENCIES as currency (currency.code)}
					<option value={currency.code}>{currency.code}</option>
				{/each}
			</select>
		</label>
	</div>
	<label class="block space-y-1">
		<span class="text-label-lg">{m.account_opening()}</span>
		<input name="opening" inputmode="decimal" placeholder="0" class={inputClass} />
		<span class="block px-4 text-body-sm text-on-surface-variant">{m.account_opening_hint()}</span>
	</label>
	<button
		type="submit"
		disabled={busy}
		aria-busy={busy}
		class="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary-container px-6 py-3 text-title-sm text-on-primary shadow-lg shadow-primary-container/25 transition hover:brightness-105 disabled:opacity-60 sm:w-auto"
		>{#if busy}<Spinner />{/if}{m.account_save()}</button
	>
</form>
