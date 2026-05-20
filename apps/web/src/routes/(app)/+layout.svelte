<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import favicon from '$lib/assets/favicon.svg';
  import AppSidebar from '$lib/components/app-sidebar.svelte';
  import Header from '$lib/components/navigation/header.svelte';
  import LocaleSwitcherLinks from '$lib/components/locale-switcher-links.svelte';
  import * as Sidebar from '$lib/components/ui/sidebar/index.js';
  import { authState } from '$lib/auth.svelte.js';

  let { children } = $props();

  onMount(() => {
    if (!authState.isAuthenticated) {
      goto('/auth/sign-in');
    }
  });
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<Sidebar.Provider>
  <AppSidebar />
  <Sidebar.Inset>
    <Header />
    <main id="main-content" class="flex flex-1 flex-col gap-4 p-4 pt-0">
      <a
        href="#main-content"
        class="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:rounded focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to main content
      </a>
      {@render children()}
    </main>
  </Sidebar.Inset>
</Sidebar.Provider>
<LocaleSwitcherLinks />
