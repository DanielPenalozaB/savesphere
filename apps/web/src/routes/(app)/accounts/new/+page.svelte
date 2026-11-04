<script lang="ts">
	import PageHeader from '#lib/components/page-header.svelte';
	import AccountForm from '#lib/components/ledger/account-form.svelte';
	import { m } from '#lib/paraglide/messages.js';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<svelte:head>
	<title>{m.account_new_title()} · {m.app_name()}</title>
</svelte:head>

<PageHeader title={m.account_new_title()} intro={m.account_form_intro()} />
<div class="max-w-xl card">
	<AccountForm defaultCurrency={data.settings.baseCurrency} error={form?.error} />
</div>
