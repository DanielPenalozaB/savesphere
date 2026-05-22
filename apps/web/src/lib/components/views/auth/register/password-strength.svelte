<script lang="ts">
  import { slide } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import * as m from '$lib/paraglide/messages.js';
  import CheckIcon from '@lucide/svelte/icons/check';
  import XIcon from '@lucide/svelte/icons/x';

  let { password = '' }: { password?: string } = $props();

  const requirements = $derived([
    { label: m.auth_password_req_length(), met: password.length >= 8 },
    { label: m.auth_password_req_uppercase(), met: /[A-Z]/.test(password) },
    { label: m.auth_password_req_number(), met: /\d/.test(password) }
  ]);

  const metCount = $derived(requirements.filter((r) => r.met).length);

  const strength = $derived.by(() => {
    if (metCount === 3) return 'strong' as const;
    if (metCount === 2) return 'medium' as const;
    return 'weak' as const;
  });

  const strengthConfig = {
    weak: { label: m.auth_password_strength_weak(), color: 'bg-red-500', text: 'text-red-500' },
    medium: {
      label: m.auth_password_strength_medium(),
      color: 'bg-amber-500',
      text: 'text-amber-500'
    },
    strong: {
      label: m.auth_password_strength_strong(),
      color: 'bg-green-500',
      text: 'text-green-500'
    }
  };

  const config = $derived(strengthConfig[strength]);
</script>

{#if password.length > 0}
  <div class="flex flex-col gap-2" transition:slide={{ duration: 250, easing: cubicOut }}>
    <!-- Segmented bar -->
    <div class="flex items-center gap-2">
      <div class="flex flex-1 gap-1">
        {#each [1, 2, 3] as segment}
          <div
            class="h-1.5 flex-1 rounded-full transition-colors duration-200"
            class:bg-muted={segment > metCount}
            class:bg-red-500={segment <= metCount && strength === 'weak'}
            class:bg-amber-500={segment <= metCount && strength === 'medium'}
            class:bg-green-500={segment <= metCount && strength === 'strong'}
          ></div>
        {/each}
      </div>
      <span class="text-xs font-medium {config.text}">{config.label}</span>
    </div>

    <!-- Checklist -->
    <ul class="flex flex-col gap-1">
      {#each requirements as req}
        <li class="flex items-center gap-1.5 text-xs">
          {#if req.met}
            <CheckIcon class="size-3 text-green-500" aria-hidden="true" />
            <span class="text-muted-foreground line-through">{req.label}</span>
          {:else}
            <XIcon class="size-3 text-muted-foreground" aria-hidden="true" />
            <span class="text-muted-foreground">{req.label}</span>
          {/if}
        </li>
      {/each}
    </ul>
  </div>
{/if}
