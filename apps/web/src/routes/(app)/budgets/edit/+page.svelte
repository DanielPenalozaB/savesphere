<script lang="ts">
	import { SUPPORTED_CURRENCIES, type BudgetBucket } from '@savesphere/contracts';
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import { BUCKETS, suggestedBucket } from '#lib/budgets.ts';
	import { categoryIcon, categoryLabel, sortCategories } from '#lib/categories.ts';
	import FormError from '#lib/components/form/form-error.svelte';
	import PageHeader from '#lib/components/page-header.svelte';
	import Spinner from '#lib/components/spinner.svelte';
	import { formatMoney } from '#lib/money.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { toast } from '#lib/toast.svelte.ts';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	let busy = $state(false);

	const title = $derived(data.budget ? m.budgets_form_edit_title() : m.budgets_form_new_title());
	const currency = $derived(data.budget?.currency ?? data.settings.baseCurrency);
	const expense = $derived(
		sortCategories(
			data.categories.filter((c) => c.kind === 'expense'),
			data.locale
		)
	);
	const limits = $derived(new Map(data.budget?.limits.map((l) => [l.categoryId, l]) ?? []));
	const bucketLabels: Record<BudgetBucket, () => string> = {
		needs: m.budgets_bucket_short_needs,
		wants: m.budgets_bucket_short_wants,
		savings: m.budgets_bucket_short_savings
	};
	const errorMessage = $derived.by(() => {
		if (!form?.error) return null;
		switch (form.error) {
			case 'name':
				return m.budgets_error_name();
			case 'empty':
				return m.budgets_error_empty();
			case 'amount': {
				const category = expense.find((c) => c.id === form.categoryId);
				return m.budgets_error_amount({ category: category ? categoryLabel(category) : '' });
			}
			default:
				return m.budgets_error_generic();
		}
	});
	const inputClass =
		'w-full rounded-2xl border-0 bg-surface-container-low px-4 py-3 text-body-lg text-on-surface focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary-container';
</script>

<svelte:head>
	<title>{title} · {m.app_name()}</title>
</svelte:head>

<PageHeader {title} intro={m.budgets_form_intro()} />
<form
	method="POST"
	class="max-w-3xl space-y-6"
	use:enhance={() => {
		busy = true;
		return async ({ result, update }) => {
			if (result.type === 'redirect') toast(m.budgets_saved());
			await update({ reset: false });
			busy = false;
		};
	}}
>
	{#if errorMessage}<FormError message={errorMessage} />{/if}
	<div class="grid gap-4 card sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
		<label class="block space-y-1">
			<span class="text-label-lg">{m.budgets_form_name()}</span>
			<input
				name="name"
				required
				maxlength="80"
				value={data.budget?.name ?? m.budgets_form_name_default()}
				class={inputClass}
			/>
		</label>
		<label class="block space-y-1">
			<span class="text-label-lg">{m.account_currency()}</span>
			<!-- A budget's currency is fixed once created. -->
			<select name="currency" value={currency} disabled={!!data.budget} class={inputClass}>
				{#each SUPPORTED_CURRENCIES as option (option.code)}
					<option value={option.code}>{option.code}</option>
				{/each}
			</select>
		</label>
	</div>

	<section class="card">
		<h2 id="envelopes-heading" class="text-title-lg mb-2">{m.budgets_form_envelopes()}</h2>
		<fieldset aria-labelledby="envelopes-heading">
			<ul class="divide-y divide-outline-variant/40">
				{#each expense as category (category.id)}
					{@const Icon = categoryIcon(category.icon)}
					{@const limit = limits.get(category.id)}
					{@const label = categoryLabel(category)}
					<li
						class="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-center gap-x-3 gap-y-2 py-3 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,0.9fr)]"
					>
						<span class="col-span-2 flex min-w-0 items-center gap-2 text-label-lg sm:col-span-1">
							<Icon class="size-5 shrink-0 text-on-surface-variant" aria-hidden="true" />
							<span class="truncate">{label}</span>
						</span>
						<input
							name="limit:{category.id}"
							inputmode="decimal"
							placeholder="0"
							aria-label={m.budgets_form_limit_label({ category: label })}
							aria-invalid={form?.error === 'amount' && form.categoryId === category.id}
							value={limit
								? formatMoney(limit.limitMinor, currency, data.locale, { plain: true })
								: ''}
							class={inputClass}
						/>
						<select
							name="bucket:{category.id}"
							aria-label={m.budgets_form_bucket_label({ category: label })}
							value={limit?.bucket ?? suggestedBucket(category)}
							class={inputClass}
						>
							{#each BUCKETS as bucket (bucket)}
								<option value={bucket}>{bucketLabels[bucket]()}</option>
							{/each}
						</select>
					</li>
				{/each}
			</ul>
		</fieldset>
	</section>

	<div class="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
		<a
			href={resolve('budgets')}
			class="inline-flex items-center justify-center rounded-full px-6 py-3 text-title-sm text-on-surface-variant transition hover:bg-surface-container-low"
			>{m.tx_cancel()}</a
		>
		<button
			type="submit"
			disabled={busy}
			aria-busy={busy}
			class="inline-flex items-center justify-center gap-2 rounded-full bg-primary-container px-6 py-3 text-title-sm text-on-primary shadow-lg shadow-primary-container/25 transition hover:brightness-105 disabled:opacity-60"
			>{#if busy}<Spinner />{/if}{m.budgets_form_save()}</button
		>
	</div>
</form>
