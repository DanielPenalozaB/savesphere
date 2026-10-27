<script lang="ts">
	import { SUPPORTED_CURRENCIES } from '@savesphere/contracts';
	import { enhance } from '$app/forms';
	import FormError from '#lib/components/form/form-error.svelte';
	import PageHeader from '#lib/components/page-header.svelte';
	import { m } from '#lib/paraglide/messages.js';
	import Spinner from '#lib/components/spinner.svelte';
	import { toast } from '#lib/toast.svelte.ts';
	import type { GoalFormError } from '#lib/server/goal-form.ts';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	let busy = $state(false);

	const errors: Record<GoalFormError, () => string> = {
		name: m.goal_error_name,
		amount: m.tx_error_amount,
		date: m.goal_error_date,
		generic: m.goal_error_generic
	};
	const inputClass =
		'w-full rounded-2xl border-0 bg-surface-container-low px-4 py-3 text-body-lg text-on-surface focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary-container';
</script>

<svelte:head>
	<title>{m.goal_new_title()} · {m.app_name()}</title>
</svelte:head>

<PageHeader title={m.goal_new_title()} intro={m.goal_new_intro()} />
<div class="max-w-xl card">
	<form
		method="POST"
		class="space-y-4"
		use:enhance={() => {
			busy = true;
			return async ({ result, update }) => {
				if (result.type === 'redirect') toast(m.goal_created());
				await update({ reset: false });
				busy = false;
			};
		}}
	>
		{#if form?.error}<FormError message={errors[form.error]()} />{/if}
		<label class="block space-y-1">
			<span class="text-label-lg">{m.goal_name()}</span>
			<input
				name="name"
				required
				maxlength="80"
				placeholder={m.goal_name_placeholder()}
				class={inputClass}
			/>
		</label>
		<div class="grid gap-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
			<label class="block space-y-1">
				<span class="text-label-lg">{m.goal_target()}</span>
				<input name="target" inputmode="decimal" required placeholder="0" class={inputClass} />
			</label>
			<label class="block space-y-1">
				<span class="text-label-lg">{m.account_currency()}</span>
				<select name="currency" value={data.settings.baseCurrency} class={inputClass}>
					{#each SUPPORTED_CURRENCIES as currency (currency.code)}
						<option value={currency.code}>{currency.code}</option>
					{/each}
				</select>
			</label>
		</div>
		<label class="block space-y-1">
			<span class="text-label-lg">{m.goal_date()}</span>
			<input type="date" name="targetDate" min={data.today} class={inputClass} />
		</label>
		<button
			type="submit"
			disabled={busy}
			aria-busy={busy}
			class="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary-container px-6 py-3 text-title-sm text-on-primary shadow-lg shadow-primary-container/25 transition hover:brightness-105 disabled:opacity-60 sm:w-auto"
			>{#if busy}<Spinner />{/if}{m.goal_save()}</button
		>
	</form>
</div>
