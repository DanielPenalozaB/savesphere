<script lang="ts">
  import RegisterForm from '$lib/components/views/auth/register/register-form.svelte';
  import GalleryVerticalEndIcon from '@lucide/svelte/icons/gallery-vertical-end';
  import * as m from '$lib/paraglide/messages.js';
</script>

<svelte:head>
  <title>SaveSphere | {m.auth_register_title()}</title>
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
    <RegisterForm />
  </div>
</main>
