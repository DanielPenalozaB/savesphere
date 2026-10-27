<script lang="ts">
	import IconMail from '~icons/material-symbols/mail-outline';
	import IconPerson from '~icons/material-symbols/person-outline';
	import { onMount } from 'svelte';
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import { authErrorMessages } from '#lib/auth/messages.ts';
	import AuthSubmit from '#lib/components/form/auth-submit.svelte';
	import FormError from '#lib/components/form/form-error.svelte';
	import PasswordField from '#lib/components/form/password-field.svelte';
	import TextField from '#lib/components/form/text-field.svelte';
	import { m } from '#lib/paraglide/messages.js';
	import type { PageProps } from './$types';

	let { form }: PageProps = $props();
	// Keep what the user typed (except the password) when the server sends the form back.
	// svelte-ignore state_referenced_locally
	let name = $state(form?.name ?? '');
	// svelte-ignore state_referenced_locally
	let email = $state(form?.email ?? '');
	let password = $state('');
	let busy = $state(false);
	let regional = $state({ timezone: '', locale: '' });
	onMount(() => {
		regional = {
			timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
			locale: navigator.language
		};
	});
</script>

<svelte:head>
	<title>{m.auth_sign_up_cta()} · {m.app_name()}</title>
</svelte:head>

<h1 class="text-headline-lg">{m.auth_sign_up_title()}</h1>
<p class="mt-1 text-body-lg text-on-surface-variant">{m.auth_sign_up_intro()}</p>

<form
	method="POST"
	class="mt-8 space-y-5"
	use:enhance={() => {
		busy = true;
		return async ({ update }) => {
			await update({ reset: false });
			busy = false;
		};
	}}
>
	{#if form?.error}<FormError message={authErrorMessages[form.error]()} />{/if}
	<TextField
		label={m.auth_name()}
		name="name"
		autocomplete="name"
		required
		icon={IconPerson}
		bind:value={name}
	/>
	<TextField
		label={m.auth_email()}
		type="email"
		name="email"
		autocomplete="email"
		required
		icon={IconMail}
		bind:value={email}
	/>
	<PasswordField
		label={m.auth_password()}
		name="password"
		autocomplete="new-password"
		required
		minlength={8}
		hint={m.auth_password_hint()}
		bind:value={password}
	/>
	<!-- Filled in the browser; without JS the account keeps the defaults. -->
	<input type="hidden" name="timezone" value={regional.timezone} />
	<input type="hidden" name="locale" value={regional.locale} />
	<AuthSubmit {busy} label={m.auth_sign_up_cta()} />
</form>

<p class="mt-6 text-center text-body-md text-on-surface-variant">
	{m.auth_have_account()}
	<a href={resolve('login')} class="font-semibold text-primary hover:underline"
		>{m.auth_go_sign_in()}</a
	>
</p>
