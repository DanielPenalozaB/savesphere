<script lang="ts">
  import { resolve } from '$app/paths';
  import { page } from '$app/state';
  import { locales } from '$lib/paraglide/runtime';
  import { toLocalizedPath } from '$lib/utils';
</script>

<div style="display:none" aria-hidden="true">
  {#each locales as locale (locale)}
    <a href={resolve(toLocalizedPath(page.url.pathname, { locale }))}>
      {locale}
    </a>
  {/each}
</div>
