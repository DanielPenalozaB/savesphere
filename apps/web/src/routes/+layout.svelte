<script lang="ts">
  import { resolve } from '$app/paths';
  import { page } from '$app/state';
  import favicon from '$lib/assets/favicon.svg';
  import AppSidebar from '$lib/components/app-sidebar.svelte';
  import Header from '$lib/components/navigation/header.svelte';
  import * as Sidebar from '$lib/components/ui/sidebar/index.js';
  import { locales } from '$lib/paraglide/runtime';
  import { toLocalizedPath } from '$lib/utils';
  import './layout.css';

  let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
{#if page.url.pathname.includes('/dashboard')}
  {@render children()}
{:else}
  <Sidebar.Provider>
    <AppSidebar />
    <Sidebar.Inset>
      <Header />
      <div class="flex flex-1 flex-col gap-4 p-4 pt-0">
        {@render children()}
      </div>
    </Sidebar.Inset>
  </Sidebar.Provider>
{/if}
<div style="display:none">
  {#each locales as locale (locale)}
    <a href={resolve(toLocalizedPath(page.url.pathname, { locale }))}>
      {locale}
    </a>
  {/each}
</div>
