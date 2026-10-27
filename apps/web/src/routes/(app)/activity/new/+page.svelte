<script lang="ts">
	import { resolve } from '$app/paths';
	import PageHeader from '#lib/components/page-header.svelte';
	import AccountForm from '#lib/components/ledger/account-form.svelte';
	import TransactionForm from '#lib/components/ledger/transaction-form.svelte';
	import { m } from '#lib/paraglide/messages.js';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<svelte:head>
	<title>{m.tx_form_title()} · {m.app_name()}</title>
</svelte:head>

<PageHeader title={m.tx_form_title()} />
<div class="max-w-xl card">
	{#if data.accounts.length === 0}
		<h2 class="text-headline-md">{m.account_form_title()}</h2>
		<p class="mt-1 mb-5 text-on-surface-variant">{m.account_form_intro()}</p>
		<AccountForm defaultCurrency={data.settings.baseCurrency} />
	{:else}
		<TransactionForm
			accounts={data.accounts}
			categories={data.categories}
			today={data.today}
			clientRef={data.clientRef}
			values={form?.values}
			error={form?.error}
		/>
		<p class="mt-4 text-center">
			<a href={resolve('activity')} class="text-label-lg text-primary hover:underline"
				>{m.tx_cancel()}</a
			>
		</p>
	{/if}
</div>
