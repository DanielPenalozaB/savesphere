<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
</script>

<svelte:head>
	<title>{m.ai_settings_title()} · {m.app_name()}</title>
</svelte:head>

<!-- Placeholder: the provider form (PUT /api/ai/credentials) is built with the Settings screens. -->
<main class="mx-auto max-w-md px-4 py-8">
	<h1 class="text-2xl font-semibold">{m.ai_settings_title()}</h1>
	<p class="mt-2 text-slate-600">{m.ai_settings_intro()}</p>
</main>
