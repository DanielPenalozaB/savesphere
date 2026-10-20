<script lang="ts">
	import type { Capabilities } from '@savesphere/contracts';
	import type { Snippet } from 'svelte';
	import { resolve } from '$app/paths';
	import { m } from '#lib/paraglide/messages.js';

	interface Props {
		ai: Capabilities['ai'];
		/** Human-readable feature name, e.g. "Receipt scanning". */
		feature: string;
		children: Snippet;
	}

	let { ai, feature, children }: Props = $props();
	let open = $state(false);

	const reasons = {
		not_configured: m.ai_locked_not_configured,
		invalid_key: m.ai_locked_invalid_key,
		disabled_by_user: m.ai_locked_disabled_by_user
	} as const;
</script>

{#if ai.available}
	{@render children()}
{:else}
	<!-- AI-only features stay visible so users know they exist, but cannot be used. -->
	<div class="relative" data-ai-locked>
		<div class="pointer-events-none opacity-50 select-none" inert>
			{@render children()}
		</div>
		<button
			type="button"
			class="absolute inset-0 flex items-start justify-end rounded-2xl p-2"
			aria-label={m.ai_locked_label({ feature })}
			aria-expanded={open}
			onclick={() => (open = !open)}
		>
			<span class="rounded-full bg-teal-700 px-2 py-0.5 text-xs font-medium text-white">
				🔒 {m.ai_badge()}
			</span>
		</button>
		{#if open}
			<div role="status" class="mt-2 rounded-xl bg-teal-50 p-3 text-sm text-teal-900">
				<p>{reasons[ai.reason ?? 'not_configured']()}</p>
				<a href={resolve('/settings/ai')} class="mt-1 inline-block font-medium underline"
					>{m.ai_locked_cta()}</a
				>
			</div>
		{/if}
	</div>
{/if}
