<script lang="ts">
  import '../app.css';
  import { getLocale } from '$lib/paraglide/runtime.js';
  import { Toaster } from 'svelte-sonner';

  let { children } = $props();

  const locale = $derived(getLocale());

  $effect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
    }
  });
</script>

<Toaster
  position="top-right"
  richColors
  gap={8}
  toastOptions={{
    class: 'sileo-toast'
  }}
/>
{@render children()}
