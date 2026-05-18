<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import favicon from '$lib/assets/favicon.svg';
  import LocaleSwitcherLinks from '$lib/components/locale-switcher-links.svelte';
  import { authState } from '$lib/auth.svelte.js';

  let { children } = $props();

  onMount(() => {
    if (authState.isAuthenticated) {
      goto('/');
    }
  });
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
{@render children()}
<LocaleSwitcherLinks />
