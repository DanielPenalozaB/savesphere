<script lang="ts">
	import IconLock from '~icons/material-symbols/lock-outline';
	import IconHide from '~icons/material-symbols/visibility-off-outline';
	import IconShow from '~icons/material-symbols/visibility-outline';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { m } from '#lib/paraglide/messages.js';
	import TextField from './text-field.svelte';

	interface Props extends Omit<HTMLInputAttributes, 'value' | 'type'> {
		label: string;
		value: string;
		hint?: string;
	}

	let { value = $bindable(), ...rest }: Props = $props();
	let visible = $state(false);
</script>

<TextField bind:value type={visible ? 'text' : 'password'} icon={IconLock} {...rest}>
	{#snippet trailing()}
		<button
			type="button"
			onclick={() => (visible = !visible)}
			aria-label={visible ? m.auth_hide_password() : m.auth_show_password()}
			aria-pressed={visible}
			class="flex size-9 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container"
		>
			{#if visible}<IconHide class="size-5" aria-hidden="true" />{:else}<IconShow
					class="size-5"
					aria-hidden="true"
				/>{/if}
		</button>
	{/snippet}
</TextField>
