<script lang="ts">
  import '../app.css';
  import { getLocale } from '$lib/paraglide/runtime.js';

  let { children } = $props();

  const locale = $derived(getLocale());

  $effect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
    }
  });
</script>

{@render children()}
