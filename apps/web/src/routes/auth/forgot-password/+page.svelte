<script lang="ts">
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
  import { notify } from '$lib/components/ui/toast/index.js';

  let email = $state('');
  let isSubmitting = $state(false);

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    isSubmitting = true;

    const { error } = await apiPost('/api/auth/forgot-password', { email });
    isSubmitting = false;

    if (error) {
      notify.error(m.auth_error_unexpected());
      return;
    }

    notify.success(m.auth_forgot_success());
    email = '';
  }
</script>

<svelte:head>
  <title>SaveSphere | {m.auth_forgot_title()}</title>
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
        <Card.Title tag="h1" class="text-xl">{m.auth_forgot_title()}</Card.Title>
        <Card.Description>{m.auth_forgot_description()}</Card.Description>
      </Card.Header>
      <Card.Content>
        <form onsubmit={handleSubmit} aria-busy={isSubmitting}>
          <FieldGroup>
            <Field>
              <FieldLabel for="email">{m.auth_email_label()}</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder={m.auth_email_placeholder()}
                bind:value={email}
                autocomplete="email"
              />
            </Field>

            <Field>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? m.auth_forgot_loading() : m.auth_forgot_submit()}
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
