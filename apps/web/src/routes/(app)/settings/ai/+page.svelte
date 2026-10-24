<script lang="ts">
	import PageHeader from '#lib/components/page-header.svelte';
	import { m } from '#lib/paraglide/messages.js';
</script>

<svelte:head>
	<title>{m.ai_settings_title()} · {m.app_name()}</title>
</svelte:head>

<!-- Placeholder: the provider form (PUT /api/ai/credentials) is built with the Settings screens. -->
<PageHeader title={m.ai_settings_title()} intro={m.ai_settings_intro()} />
