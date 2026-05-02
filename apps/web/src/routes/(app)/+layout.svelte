<script lang="ts">
  import favicon from '$lib/assets/favicon.svg';
  import AppSidebar from '$lib/components/app-sidebar.svelte';
  import Header from '$lib/components/navigation/header.svelte';
  import LocaleSwitcherLinks from '$lib/components/locale-switcher-links.svelte';
  import * as Sidebar from '$lib/components/ui/sidebar/index.js';
  import '../../app.css';

  let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<Sidebar.Provider>
  <AppSidebar />
  <Sidebar.Inset>
    <Header />
    <div class="flex flex-1 flex-col gap-4 p-4 pt-0">
      {@render children()}
    </div>
  </Sidebar.Inset>
</Sidebar.Provider>
<LocaleSwitcherLinks />
