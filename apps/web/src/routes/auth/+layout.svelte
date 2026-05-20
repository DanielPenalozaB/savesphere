<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import favicon from '$lib/assets/favicon.svg';
  import LocaleSwitcherLinks from '$lib/components/locale-switcher-links.svelte';
  import { authState } from '$lib/auth.svelte.js';
  import { setLocale, getLocale } from '$lib/paraglide/runtime.js';
  import Globe from '@lucide/svelte/icons/globe';

  let { children } = $props();

  onMount(() => {
    if (authState.isAuthenticated) {
      goto('/');
    }
  });

  const currentLocale = $derived(getLocale());
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<a
  href="#auth-main"
  class="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:rounded focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
>
  Skip to main content
</a>
{@render children()}

<!-- Language Switcher -->
<div class="fixed bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border bg-card px-4 py-2 shadow-sm">
  <Globe class="size-4 text-muted-foreground" aria-hidden="true" />
  <button
    type="button"
    class="text-sm font-medium transition-colors {currentLocale === 'en' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}"
    onclick={() => setLocale('en')}
    aria-label="English"
  >
    EN
  </button>
  <span class="text-muted-foreground" aria-hidden="true">|</span>
  <button
    type="button"
    class="text-sm font-medium transition-colors {currentLocale === 'es' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}"
    onclick={() => setLocale('es')}
    aria-label="Español"
  >
    ES
  </button>
</div>

<LocaleSwitcherLinks />
