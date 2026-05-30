<script lang="ts">
  import '../app.css';
  import { getLocale } from '$lib/paraglide/runtime.js';
  import { Toaster } from '$lib/components/ui/toast';

  let { children } = $props();

  const locale = $derived(getLocale());

  $effect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
    }
  });
</script>

<Toaster />
{@render children()}
