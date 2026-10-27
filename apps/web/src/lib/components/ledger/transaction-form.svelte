<script lang="ts">
	import type { Account, Category } from '@savesphere/contracts';
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import { categoryIcon, categoryLabel, sortCategories } from '#lib/categories.ts';
	import { getLocale } from '#lib/paraglide/runtime.js';
	import FormError from '#lib/components/form/form-error.svelte';
	import { m } from '#lib/paraglide/messages.js';
	import Spinner from '#lib/components/spinner.svelte';
	import type {
		TransactionFormError,
		TransactionFormValues
	} from '#lib/server/transaction-form.ts';

	interface Props {
		accounts: Account[];
		categories: Category[];
		/** Today in the user's time zone (YYYY-MM-DD). */
		today: string;
		clientRef: string;
		values?: TransactionFormValues | null;
		error?: TransactionFormError | 'generic' | null;
		/** Called after a successful save instead of navigating (the sheet closes itself). */
		onsaved?: () => void;
		oncancel?: () => void;
	}

	let {
		accounts,
		categories,
		today,
		clientRef,
		values = null,
		error = $bindable(null),
		onsaved,
		oncancel
	}: Props = $props();

	// svelte-ignore state_referenced_locally
	const initial = values;
	let kind = $state<TransactionFormValues['kind']>(initial?.kind ?? 'expense');
	// svelte-ignore state_referenced_locally
	const firstAccounts = accounts;
	let accountId = $state(initial?.accountId || firstAccounts[0]?.id || '');
	let toAccountId = $state(
		initial?.toAccountId || firstAccounts.find((a) => a.id !== accountId)?.id || ''
	);
	let categoryId = $state(initial?.categoryId ?? '');
	let busy = $state(false);

	const account = $derived(accounts.find((a) => a.id === accountId));
	const toAccount = $derived(accounts.find((a) => a.id === toAccountId));
	const crossCurrency = $derived(
		kind === 'transfer' && account && toAccount && account.currency !== toAccount.currency
	);
	const visibleCategories = $derived(
		sortCategories(
			categories.filter((c) => c.kind === kind),
			getLocale()
		)
	);
	const kinds = [
		{ value: 'expense', label: m.kind_expense },
		{ value: 'income', label: m.kind_income },
		{ value: 'transfer', label: m.kind_transfer }
	] as const;
	const errors: Record<NonNullable<Props['error']>, () => string> = {
		amount: m.tx_error_amount,
		amount_received: m.tx_error_amount,
		account: m.tx_error_account,
		category: m.tx_error_category,
		same_account: m.tx_error_same_account,
		generic: m.tx_error_generic
	};
	const inputClass =
		'w-full rounded-2xl border-0 bg-surface-container-low px-4 py-3 text-body-lg text-on-surface focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary-container';
</script>

<form
	method="POST"
	action={resolve('activity/new')}
	class="space-y-5"
	use:enhance={() => {
		busy = true;
		return async ({ result, update }) => {
			busy = false;
			if (result.type === 'redirect' && onsaved) {
				onsaved();
				return;
			}
			if (result.type === 'failure') {
				error = (result.data?.error as Props['error']) ?? 'generic';
				return;
			}
			await update();
		};
	}}
>
	<input type="hidden" name="clientRef" value={clientRef} />
	{#if error}<FormError message={errors[error]()} />{/if}

	<fieldset>
		<legend class="sr-only">{m.tx_form_title()}</legend>
		<div class="grid grid-cols-3 gap-1 rounded-full bg-surface-container-low p-1">
			{#each kinds as option (option.value)}
				<label
					class="cursor-pointer rounded-full px-3 py-2 text-center text-label-lg text-on-surface-variant transition has-checked:bg-primary-container has-checked:text-on-primary has-checked:shadow-sm"
				>
					<input type="radio" name="kind" value={option.value} bind:group={kind} class="sr-only" />
					{option.label()}
				</label>
			{/each}
		</div>
	</fieldset>

	<label class="block rounded-3xl bg-surface-container-low px-5 py-4">
		<span class="text-label-sm tracking-wider text-on-surface-variant uppercase"
			>{m.tx_amount()}</span
		>
		<span class="mt-1 flex items-baseline gap-2">
			<span class="font-display text-headline-lg text-primary-container">$</span>
			<!-- The amount is what people type first; the quick-add dialog focuses it on open. -->
			<!-- svelte-ignore a11y_autofocus -->
			<input
				name="amount"
				autofocus
				inputmode="decimal"
				autocomplete="off"
				required
				value={initial?.amount ?? ''}
				placeholder="0"
				class="w-full border-0 bg-transparent p-0 font-display text-headline-xl text-on-surface placeholder:text-on-surface-variant/40 focus:ring-0"
			/>
			<span class="text-title-sm text-on-surface-variant">{account?.currency}</span>
		</span>
	</label>

	{#if kind === 'transfer'}
		<div class="grid gap-4 sm:grid-cols-2">
			<label class="block space-y-1">
				<span class="text-label-lg">{m.tx_from_account()}</span>
				<select name="accountId" bind:value={accountId} class={inputClass}>
					{#each accounts as option (option.id)}
						<option value={option.id}>{option.name} · {option.currency}</option>
					{/each}
				</select>
			</label>
			<label class="block space-y-1">
				<span class="text-label-lg">{m.tx_to_account()}</span>
				<select name="toAccountId" bind:value={toAccountId} class={inputClass}>
					{#each accounts as option (option.id)}
						<option value={option.id}>{option.name} · {option.currency}</option>
					{/each}
				</select>
			</label>
		</div>
		{#if crossCurrency}
			<label class="block space-y-1">
				<span class="text-label-lg">{m.tx_amount_received()} ({toAccount?.currency})</span>
				<input
					name="amountReceived"
					inputmode="decimal"
					required
					value={initial?.amountReceived ?? ''}
					class={inputClass}
				/>
				<span class="block px-4 text-body-sm text-on-surface-variant"
					>{m.tx_amount_received_hint()}</span
				>
			</label>
		{/if}
	{:else}
		<fieldset>
			<legend class="mb-2 text-label-lg">{m.tx_category()}</legend>
			<div class="grid grid-cols-3 gap-2 sm:grid-cols-4">
				{#each visibleCategories as category (category.id)}
					{@const Icon = categoryIcon(category.icon)}
					<label
						class="flex cursor-pointer flex-col items-center gap-1 rounded-2xl bg-surface-container-low px-2 py-3 text-center text-label-md text-on-surface-variant transition hover:bg-surface-container has-checked:bg-primary-fixed has-checked:text-on-primary-fixed-variant has-checked:ring-2 has-checked:ring-primary-container"
					>
						<input
							type="radio"
							name="categoryId"
							value={category.id}
							bind:group={categoryId}
							required
							class="sr-only"
						/>
						<Icon class="size-6" aria-hidden="true" />
						<span class="line-clamp-2">{categoryLabel(category)}</span>
					</label>
				{/each}
			</div>
		</fieldset>
		<label class="block space-y-1">
			<span class="text-label-lg">{m.tx_account()}</span>
			<select name="accountId" bind:value={accountId} class={inputClass}>
				{#each accounts as option (option.id)}
					<option value={option.id}>{option.name} · {option.currency}</option>
				{/each}
			</select>
		</label>
	{/if}

	<div class="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
		<label class="block space-y-1">
			<span class="text-label-lg">{m.tx_date()}</span>
			<input
				type="date"
				name="date"
				value={initial?.date || today}
				max={today}
				required
				class={inputClass}
			/>
		</label>
		<label class="block space-y-1">
			<span class="text-label-lg">{m.tx_description()}</span>
			<input
				name="description"
				maxlength="200"
				value={initial?.description ?? ''}
				placeholder={m.tx_description_placeholder()}
				class={inputClass}
			/>
		</label>
	</div>

	<div class="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
		{#if oncancel}
			<button
				type="button"
				onclick={oncancel}
				class="rounded-full px-6 py-3 text-label-lg text-on-surface-variant hover:bg-surface-container-low"
				>{m.tx_cancel()}</button
			>
		{/if}
		<button
			type="submit"
			disabled={busy}
			aria-busy={busy}
			class="inline-flex items-center justify-center gap-2 rounded-full bg-primary-container px-6 py-3 text-title-sm text-on-primary shadow-lg shadow-primary-container/25 transition hover:brightness-105 disabled:opacity-60"
			>{#if busy}<Spinner />{/if}{m.tx_save()}</button
		>
	</div>
</form>
