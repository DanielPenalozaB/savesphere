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
  } from "$lib/components/ui/field/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { authState, type User } from "$lib/auth.svelte.js";
  import { apiPost } from "$lib/api/client.js";
  import { registerSchema } from "$lib/schemas/auth.js";
  import { cn } from "$lib/utils.js";
  import * as m from "$lib/paraglide/messages.js";
  import EyeIcon from "@lucide/svelte/icons/eye";
  import EyeOffIcon from "@lucide/svelte/icons/eye-off";
  import AlertCircleIcon from "@lucide/svelte/icons/circle-alert";
  import CheckCircleIcon from "@lucide/svelte/icons/circle-check";
  import type { HTMLAttributes } from "svelte/elements";
  import type { ZodIssue } from "zod";

  let { class: className, ...restProps }: HTMLAttributes<HTMLDivElement> = $props();

  const id = $props.id();

  let fullName = $state("");
  let email = $state("");
  let password = $state("");
  let showPassword = $state(false);
  let errors = $state<Record<string, string>>({});
  let serverError = $state("");
  let serverSuccess = $state("");
  let isSubmitting = $state(false);

  function getZodErrorMessage(issue: ZodIssue): string {
    const field = issue.path[0] as string;
    if (field === "fullName") {
      return m.auth_error_fullName_required();
    }
    if (field === "email") {
      if (issue.code === "invalid_string") return m.auth_error_email_invalid();
      return m.auth_error_email_required();
    }
    if (field === "password") {
      if (issue.code === "too_small") return m.auth_error_password_short();
      return m.auth_error_password_required();
    }
    return m.auth_error_validation();
  }

  function validate() {
    const result = registerSchema.safeParse({ fullName, email, password });
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
    if (status === 409) return m.auth_error_conflict();
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
      "/auth/register",
      { fullName, email, password }
    );

    isSubmitting = false;

    if (error) {
      serverError = mapApiError(status);
      return;
    }

    if (res) {
      serverSuccess = m.auth_success_register();
      authState.login(res.token, res.user);
      setTimeout(() => goto("/"), 800);
    }
  }
</script>

<div class={cn("flex flex-col gap-6", className)} {...restProps}>
  <Card.Root>
    <Card.Header class="text-center">
      <Card.Title class="text-xl">{m.auth_register_title()}</Card.Title>
      <Card.Description>{m.auth_register_description()}</Card.Description>
    </Card.Header>
    <Card.Content>
      <form onsubmit={handleSubmit}>
        <FieldGroup>
          {#if serverError}
            <Field>
              <div
                class="flex items-start gap-2 rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive"
                role="alert"
              >
                <AlertCircleIcon class="mt-0.5 size-4 shrink-0" />
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
                <CheckCircleIcon class="mt-0.5 size-4 shrink-0" />
                <span>{serverSuccess}</span>
              </div>
            </Field>
          {/if}

          <Field>
            <FieldLabel for="fullName-{id}">{m.auth_full_name_label()}</FieldLabel>
            <Input
              id="fullName-{id}"
              type="text"
              placeholder={m.auth_full_name_placeholder()}
              bind:value={fullName}
              aria-invalid={errors.fullName ? "true" : undefined}
            />
            {#if errors.fullName}
              <FieldError>{errors.fullName}</FieldError>
            {/if}
          </Field>

          <Field>
            <FieldLabel for="email-{id}">{m.auth_email_label()}</FieldLabel>
            <Input
              id="email-{id}"
              type="email"
              placeholder={m.auth_email_placeholder()}
              bind:value={email}
              aria-invalid={errors.email ? "true" : undefined}
            />
            {#if errors.email}
              <FieldError>{errors.email}</FieldError>
            {/if}
          </Field>

          <Field>
            <FieldLabel for="password-{id}">{m.auth_password_label()}</FieldLabel>
            <div class="relative">
              <Input
                id="password-{id}"
                type={showPassword ? "text" : "password"}
                placeholder={m.auth_password_placeholder()}
                bind:value={password}
                class="pe-9"
                aria-invalid={errors.password ? "true" : undefined}
              />
              <button
                type="button"
                onclick={() => (showPassword = !showPassword)}
                class="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {#if showPassword}
                  <EyeOffIcon class="size-4" />
                {:else}
                  <EyeIcon class="size-4" />
                {/if}
              </button>
            </div>
            {#if errors.password}
              <FieldError>{errors.password}</FieldError>
            {/if}
          </Field>

          <Field>
            <Button type="submit" disabled={isSubmitting}>
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
                {m.auth_loading_register()}
              {:else}
                {m.auth_submit_register()}
              {/if}
            </Button>
            <FieldDescription class="text-center">
              <a href="/auth/sign-in" class="underline-offset-4 hover:underline">
                {m.auth_link_login()}
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
