<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { Button } from '$lib/components/ui/button/index.js';
  import * as Card from '$lib/components/ui/card/index.js';
  import {
    Field,
    FieldLabel,
    FieldError,
    FieldGroup,
    FieldDescription
  } from '$lib/components/ui/field/index.js';
  import { Input } from '$lib/components/ui/input/index.js';
  import { apiPost } from '$lib/api/client.js';
  import * as m from '$lib/paraglide/messages.js';
  import GalleryVerticalEndIcon from '@lucide/svelte/icons/gallery-vertical-end';
  import EyeIcon from '@lucide/svelte/icons/eye';
  import EyeOffIcon from '@lucide/svelte/icons/eye-off';
  import { notify } from '$lib/components/ui/toast/index.js';

  let password = $state('');
  let confirmPassword = $state('');
  let showPassword = $state(false);
  let isSubmitting = $state(false);

  const token = $derived($page.url.searchParams.get('token'));

  function validate(): string | null {
    if (password.length < 8) return m.auth_error_password_short();
    if (password !== confirmPassword) return m.auth_error_password_mismatch();
    return null;
  }

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      notify.error(validationError);
      return;
    }

    if (!token) {
      notify.error(m.auth_reset_missing_token());
      return;
    }

    isSubmitting = true;
    const { error } = await apiPost('/api/auth/reset-password', { token, password });
    isSubmitting = false;

    if (error) {
      notify.error(m.auth_reset_invalid_token());
      return;
    }

    notify.success(m.auth_reset_success());
    setTimeout(() => goto('/auth/sign-in'), 1500);
  }
</script>

<svelte:head>
  <title>SaveSphere | {m.auth_reset_title()}</title>
</svelte:head>

<main
  id="auth-main"
  class="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10"
>
  <div class="flex w-full max-w-sm flex-col gap-6">
    <a href="/" class="flex items-center gap-2 self-center font-medium">
      <div
        class="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground"
      >
        <GalleryVerticalEndIcon class="size-4" aria-hidden="true" />
      </div>
      {m.sidebar_app_name()}
    </a>

    <Card.Root>
      <Card.Header class="text-center">
        <Card.Title tag="h1" class="text-xl">{m.auth_reset_title()}</Card.Title>
        <Card.Description>{m.auth_reset_description()}</Card.Description>
      </Card.Header>
      <Card.Content>
        <form onsubmit={handleSubmit} aria-busy={isSubmitting}>
          <FieldGroup>
            <Field>
              <FieldLabel for="password">{m.auth_password_label()}</FieldLabel>
              <div class="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={m.auth_password_placeholder()}
                  bind:value={password}
                  class="pe-9"
                  autocomplete="new-password"
                />
                <button
                  type="button"
                  onclick={() => (showPassword = !showPassword)}
                  class="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? m.auth_password_hide() : m.auth_password_show()}
                  aria-pressed={showPassword}
                >
                  {#if showPassword}
                    <EyeOffIcon class="size-4" aria-hidden="true" />
                  {:else}
                    <EyeIcon class="size-4" aria-hidden="true" />
                  {/if}
                </button>
              </div>
            </Field>

            <Field>
              <FieldLabel for="confirmPassword">{m.auth_confirm_password_label()}</FieldLabel>
              <Input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder={m.auth_confirm_password_placeholder()}
                bind:value={confirmPassword}
                autocomplete="new-password"
              />
            </Field>

            <Field>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? m.auth_reset_loading() : m.auth_reset_submit()}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </Card.Content>
    </Card.Root>

    <FieldDescription class="text-center">
      <a href="/auth/sign-in" class="underline-offset-4 hover:underline">{m.auth_link_login()}</a>
    </FieldDescription>
  </div>
</main>
