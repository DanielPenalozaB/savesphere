<script lang="ts">
  import { goto } from "$app/navigation";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Card from "$lib/components/ui/card/index.js";
  import {
    Field,
    FieldLabel,
    FieldError,
    FieldGroup,
    FieldDescription,
    FieldSeparator,
  } from "$lib/components/ui/field/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { authState, type User } from "$lib/auth.svelte.js";
  import { apiPost } from "$lib/api/client.js";
  import { loginSchema } from "$lib/schemas/auth.js";
  import { cn } from "$lib/utils.js";
  import * as m from "$lib/paraglide/messages.js";
  import EyeIcon from "@lucide/svelte/icons/eye";
  import EyeOffIcon from "@lucide/svelte/icons/eye-off";
  import AlertCircleIcon from "@lucide/svelte/icons/circle-alert";
  import CheckCircleIcon from "@lucide/svelte/icons/circle-check";
  import type { HTMLAttributes } from "svelte/elements";
  import type { ZodIssue } from "zod";
  import { startGoogleAuth } from "$lib/auth/oauth.js";

  let { class: className, ...restProps }: HTMLAttributes<HTMLDivElement> = $props();

  const id = $props.id();

  let email = $state("");
  let password = $state("");
  let showPassword = $state(false);
  let errors = $state<Record<string, string>>({});
  let serverError = $state("");
  let serverSuccess = $state("");
  let isSubmitting = $state(false);
  let isGoogleLoading = $state(false);

  function getZodErrorMessage(issue: ZodIssue): string {
    const field = issue.path[0] as string;
    if (field === "email") {
      if (issue.code === "invalid_string") return m.auth_error_email_invalid();
      return m.auth_error_email_required();
    }
    if (field === "password") {
      return m.auth_error_password_required();
    }
    return m.auth_error_validation();
  }

  function validate() {
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      errors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as string;
        errors[field] = getZodErrorMessage(issue);
      }
      return false;
    }
    errors = {};
    return true;
  }

  function mapApiError(status?: number): string {
    if (status === 401) return m.auth_error_unauthorized();
    if (status === 403) return m.auth_error_unverified();
    if (status === 400) return m.auth_error_validation();
    if (status === undefined) return m.auth_error_network();
    return m.auth_error_unexpected();
  }

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (!validate()) return;

    serverError = "";
    serverSuccess = "";
    isSubmitting = true;

    const { data: res, error, status } = await apiPost<{ user: User; token: string }>(
      "/auth/login",
      { email, password }
    );

    isSubmitting = false;

    if (error) {
      serverError = mapApiError(status);
      return;
    }

    if (res) {
      serverSuccess = m.auth_success_login();
      authState.login(res.token, res.user);
      setTimeout(() => goto("/"), 800);
    }
  }

  async function handleGoogleSignIn() {
    serverError = "";
    isGoogleLoading = true;
    try {
      await startGoogleAuth();
    } catch (err) {
      isGoogleLoading = false;
      serverError = m.auth_error_unexpected();
    }
  }
</script>

<div class={cn("flex flex-col gap-6", className)} {...restProps}>
  <Card.Root>
    <Card.Header class="text-center">
      <Card.Title tag="h1" class="text-xl">{m.auth_login_title()}</Card.Title>
      <Card.Description>{m.auth_login_description()}</Card.Description>
    </Card.Header>
    <Card.Content>
      <form onsubmit={handleSubmit} aria-busy={isSubmitting || isGoogleLoading}>
        <FieldGroup>
          {#if serverError}
            <Field>
              <div
                class="flex items-start gap-2 rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive"
                role="alert"
              >
                <AlertCircleIcon class="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <span>{serverError}</span>
              </div>
            </Field>
          {/if}

          {#if serverSuccess}
            <Field>
              <div
                class="flex items-start gap-2 rounded-md border border-green-600 bg-green-600/10 p-3 text-sm text-green-700"
                role="status"
              >
                <CheckCircleIcon class="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <span>{serverSuccess}</span>
              </div>
            </Field>
          {/if}

          <Field>
            <FieldLabel for="email-{id}">{m.auth_email_label()}</FieldLabel>
            <Input
              id="email-{id}"
              type="email"
              placeholder={m.auth_email_placeholder()}
              bind:value={email}
              autocomplete="email"
              aria-invalid={errors.email ? "true" : undefined}
              aria-describedby={errors.email ? `email-error-${id}` : undefined}
            />
            {#if errors.email}
              <FieldError id="email-error-{id}">{errors.email}</FieldError>
            {/if}
          </Field>

          <Field>
            <div class="flex items-center">
              <FieldLabel for="password-{id}">{m.auth_password_label()}</FieldLabel>
              <a
                href="/auth/forgot-password"
                class="ms-auto text-sm underline-offset-4 hover:underline"
              >
                {m.auth_link_forgot_password()}
              </a>
            </div>
            <div class="relative">
              <Input
                id="password-{id}"
                type={showPassword ? "text" : "password"}
                placeholder={m.auth_password_placeholder()}
                bind:value={password}
                class="pe-9"
                autocomplete="current-password"
                aria-invalid={errors.password ? "true" : undefined}
                aria-describedby={errors.password ? `password-error-${id}` : undefined}
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
            {#if errors.password}
              <FieldError id="password-error-{id}">{errors.password}</FieldError>
            {/if}
          </Field>

          <Field>
            <Button type="submit" disabled={isSubmitting || isGoogleLoading}>
              {#if isSubmitting}
                <svg
                  class="mr-2 size-4 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
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
                {m.auth_loading_login()}
              {:else}
                {m.auth_submit_login()}
              {/if}
            </Button>
          </Field>

          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <span class="w-full border-t"></span>
            </div>
            <div class="relative flex justify-center text-xs uppercase">
              <span class="bg-card px-2 text-muted-foreground">{m.auth_or_separator()}</span>
            </div>
          </div>

          <Field>
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting || isGoogleLoading}
              onclick={handleGoogleSignIn}
              class="w-full"
            >
              {#if isGoogleLoading}
                <svg
                  class="mr-2 size-4 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
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
                {m.auth_loading_google()}
              {:else}
                <svg class="mr-2 size-4" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62Z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z"
                    fill="#EA4335"
                  />
                </svg>
                {m.auth_submit_google()}
              {/if}
            </Button>
            <FieldDescription class="text-center">
              <a href="/auth/register" class="underline-offset-4 hover:underline">
                {m.auth_link_register()}
              </a>
            </FieldDescription>
          </Field>
        </FieldGroup>
      </form>
    </Card.Content>
  </Card.Root>
  <FieldDescription class="px-6 text-center">
    {m.auth_terms_notice()}
  </FieldDescription>
</div>
