<script lang="ts">
  import { browser } from '$app/environment';
  import { Button } from '$lib/components/ui/button/index.js';
  import { Input } from '$lib/components/ui/input/index.js';
  import { Field, FieldLabel, FieldError, FieldGroup } from '$lib/components/ui/field/index.js';
  import { authState } from '$lib/auth.svelte.js';
  import { apiPost } from '$lib/api/client.js';
  import { notify } from '$lib/components/ui/toast/index.js';
  import * as m from '$lib/paraglide/messages.js';
  import PasswordStrength from '$lib/components/views/auth/register/password-strength.svelte';
  import ShieldCheckIcon from '@lucide/svelte/icons/shield-check';
  import XIcon from '@lucide/svelte/icons/x';
  import EyeIcon from '@lucide/svelte/icons/eye';
  import EyeOffIcon from '@lucide/svelte/icons/eye-off';

  let mode = $state<'suggest' | 'form' | 'hidden'>('suggest');
  let password = $state('');
  let confirmPassword = $state('');
  let showPassword = $state(false);
  let showConfirmPassword = $state(false);
  let isSubmitting = $state(false);
  let formError = $state('');

  let isVisible = $state(false);

  $effect(() => {
    if (browser && authState.user?.authProvider === 'google' && mode !== 'hidden') {
      const skipped = localStorage.getItem('skipped_password_setup');
      isVisible = skipped !== authState.user.id;
    } else {
      isVisible = false;
    }
  });

  function skip() {
    if (authState.user) {
      localStorage.setItem('skipped_password_setup', authState.user.id);
    }
    mode = 'hidden';
    isVisible = false;
  }

  function validatePasswords(): boolean {
    if (password.length < 8) {
      formError = m.auth_error_password_short();
      return false;
    }
    const hasUpper = /[A-Z]/.test(password);
    const hasDigit = /\d/.test(password);
    if (!hasUpper || !hasDigit) {
      formError = m.auth_error_password_complexity();
      return false;
    }
    if (password !== confirmPassword) {
      formError = m.auth_error_password_mismatch();
      return false;
    }
    formError = '';
    return true;
  }

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (!validatePasswords()) return;

    isSubmitting = true;
    const { error: apiError } = await apiPost('/api/set-password', { password });
    isSubmitting = false;

    if (apiError) {
      formError = apiError;
      return;
    }

    notify.success(m.auth_set_password_success());
    if (authState.user) {
      localStorage.setItem('skipped_password_setup', authState.user.id);
    }
    mode = 'hidden';
    isVisible = false;
    password = '';
    confirmPassword = '';
  }
</script>

{#if isVisible}
  <div
    class="relative overflow-hidden rounded-xl border bg-gradient-to-br from-blue-50 to-indigo-50 p-6 shadow-sm dark:from-blue-950/30 dark:to-indigo-950/30"
  >
    <button
      type="button"
      onclick={skip}
      class="absolute top-3 right-3 rounded-md p-1 text-muted-foreground transition-colors hover:bg-black/5 hover:text-foreground dark:hover:bg-white/10"
      aria-label="Dismiss"
    >
      <XIcon class="size-4" />
    </button>

    {#if mode === 'suggest'}
      <div class="flex items-start gap-4">
        <div
          class="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400"
        >
          <ShieldCheckIcon class="size-5" />
        </div>
        <div class="flex-1 space-y-3">
          <div>
            <h3 class="font-semibold text-foreground">{m.auth_set_password_banner_title()}</h3>
            <p class="mt-1 text-sm leading-relaxed text-muted-foreground">
              {m.auth_set_password_banner_description()}
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-3">
            <Button size="sm" onclick={() => (mode = 'form')}>
              {m.auth_set_password_banner_action()}
            </Button>
            <Button size="sm" variant="ghost" onclick={skip}>
              {m.auth_set_password_banner_skip()}
            </Button>
          </div>
        </div>
      </div>
    {:else}
      <div class="flex items-start gap-4">
        <div
          class="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400"
        >
          <ShieldCheckIcon class="size-5" />
        </div>
        <div class="flex-1 space-y-4">
          <div>
            <h3 class="font-semibold text-foreground">{m.auth_set_password_form_title()}</h3>
            <p class="mt-1 text-sm text-muted-foreground">
              {m.auth_set_password_form_description()}
            </p>
          </div>

          <form onsubmit={handleSubmit} class="space-y-4">
            <FieldGroup>
              <Field>
                <FieldLabel for="set-password">{m.auth_password_label()}</FieldLabel>
                <div class="relative">
                  <Input
                    id="set-password"
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
                  >
                    {#if showPassword}
                      <EyeOffIcon class="size-4" />
                    {:else}
                      <EyeIcon class="size-4" />
                    {/if}
                  </button>
                </div>
                <PasswordStrength {password} />
              </Field>

              <Field>
                <FieldLabel for="set-confirm-password">{m.auth_confirm_password_label()}</FieldLabel
                >
                <div class="relative">
                  <Input
                    id="set-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder={m.auth_confirm_password_placeholder()}
                    bind:value={confirmPassword}
                    class="pe-9"
                    autocomplete="new-password"
                  />
                  <button
                    type="button"
                    onclick={() => (showConfirmPassword = !showConfirmPassword)}
                    class="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md text-muted-foreground hover:text-foreground"
                    aria-label={showConfirmPassword
                      ? m.auth_password_hide()
                      : m.auth_password_show()}
                  >
                    {#if showConfirmPassword}
                      <EyeOffIcon class="size-4" />
                    {:else}
                      <EyeIcon class="size-4" />
                    {/if}
                  </button>
                </div>
              </Field>

              {#if formError}
                <FieldError>{formError}</FieldError>
              {/if}

              <div class="flex flex-wrap items-center gap-3 pt-1">
                <Button type="submit" size="sm" disabled={isSubmitting}>
                  {#if isSubmitting}
                    <svg
                      class="mr-2 size-4 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        class="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        stroke-width="4"
                      />
                      <path
                        class="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    {m.auth_set_password_loading()}
                  {:else}
                    {m.auth_set_password_submit()}
                  {/if}
                </Button>
                <Button type="button" size="sm" variant="ghost" onclick={() => (mode = 'suggest')}>
                  {m.auth_set_password_banner_skip()}
                </Button>
              </div>
            </FieldGroup>
          </form>
        </div>
      </div>
    {/if}
  </div>
{/if}
