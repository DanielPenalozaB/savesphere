<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { apiPost } from '$lib/api/client.js';
  import { authState, type User } from '$lib/auth.svelte.js';
  import * as m from '$lib/paraglide/messages.js';
  import AlertCircleIcon from '@lucide/svelte/icons/circle-alert';
  import CheckCircleIcon from '@lucide/svelte/icons/circle-check';
  import LoaderCircleIcon from '@lucide/svelte/icons/loader-circle';

  let status = $state<'loading' | 'success' | 'error'>('loading');
  let message = $state(m.auth_oauth_loading());

  onMount(async () => {
    const errorParam = $page.url.searchParams.get('error');
    const code = $page.url.searchParams.get('code');
    const state = $page.url.searchParams.get('state');

    if (errorParam === 'access_denied') {
      status = 'error';
      message = m.auth_oauth_denied();
      return;
    }

    if (!code || !state) {
      status = 'error';
      message = m.auth_oauth_missing_params();
      return;
    }

    const { data, error } = await apiPost<{ user: User; token: string }>(
      `/api/auth/google/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`,
      {}
    );

    if (error || !data) {
      status = 'error';
      message = m.auth_oauth_failed();
      return;
    }

    authState.login(data.token, data.user);
    status = 'success';
    message = m.auth_success_login();
    setTimeout(() => goto('/'), 800);
  });
</script>

<svelte:head>
  <title>SaveSphere | {m.auth_oauth_title_loading()}</title>
</svelte:head>

<main class="flex min-h-svh items-center justify-center bg-muted p-6">
  <div class="w-full max-w-sm rounded-xl border bg-card p-8 shadow-sm">
    <div class="flex flex-col items-center gap-4 text-center">
      {#if status === 'loading'}
        <LoaderCircleIcon class="size-8 animate-spin text-primary" aria-hidden="true" />
      {:else if status === 'success'}
        <CheckCircleIcon class="size-8 text-green-600" aria-hidden="true" />
      {:else}
        <AlertCircleIcon class="size-8 text-destructive" aria-hidden="true" />
      {/if}
      <h1 class="text-lg font-semibold">
        {#if status === 'loading'}
          {m.auth_oauth_title_loading()}
        {:else if status === 'success'}
          {m.auth_oauth_title_success()}
        {:else}
          {m.auth_oauth_title_error()}
        {/if}
      </h1>
      <div aria-live="polite" aria-atomic="true">
        <p class="text-sm text-muted-foreground">{message}</p>
      </div>
      {#if status === 'error'}
        <a href="/auth/sign-in" class="text-sm font-medium underline-offset-4 hover:underline">
          {m.auth_link_login_back()}
        </a>
      {/if}
    </div>
  </div>
</main>
