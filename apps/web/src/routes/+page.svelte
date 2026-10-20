<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>{m.app_name()}</title>
</svelte:head>

<main
	class="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 px-4 text-center"
>
	<img src="/logo.svg" alt="" class="size-16" />
	<h1 class="text-3xl font-semibold text-slate-900">{m.app_name()}</h1>
	<p class="text-slate-600">{m.app_tagline()}</p>
	<p
		data-testid="api-status"
		class={[
			'rounded-full px-3 py-1 text-sm',
			data.healthy ? 'bg-teal-50 text-teal-800' : 'bg-amber-50 text-amber-800'
		]}
	>
		{data.healthy ? m.status_api_ok() : m.status_api_down()}
	</p>
</main>
