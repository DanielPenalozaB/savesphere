<script lang="ts" module>
  import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js';
  import { Separator } from '$lib/components/ui/separator/index.js';
  import * as Sidebar from '$lib/components/ui/sidebar/index.js';
  import { page } from '$app/state';
  import { routeMap, formatFallback } from '$lib/constants/route-map.js';

  import { locales } from '$lib/paraglide/runtime.js';

  const breadcrumbs = $derived.by(() => {
    const rawSegments = page.url.pathname.split('/').filter((p) => p !== '');
    const hasLocale = locales.includes(rawSegments[0] as any);
    const segments = hasLocale ? rawSegments.slice(1) : rawSegments;

    if (segments.length === 0) {
      return [
        {
          label:
            typeof routeMap.dashboard === 'function' ? routeMap.dashboard() : routeMap.dashboard,
          href: hasLocale ? `/${rawSegments[0]}` : '/',
          isLast: true
        }
      ];
    }

    return segments.map((segment, index) => {
      const pathSegments = rawSegments.slice(0, hasLocale ? index + 2 : index + 1);
      const path = `/${pathSegments.join('/')}`;
      const mapping = routeMap[segment];
      const label = typeof mapping === 'function' ? mapping() : mapping || formatFallback(segment);

      return {
        label,
        href: path,
        isLast: index === segments.length - 1
      };
    });
  });
</script>

<header class="flex h-16 shrink-0 items-center gap-2">
  <div class="flex items-center gap-2 px-4">
    <Sidebar.Trigger class="-ms-1" />
    <Separator orientation="vertical" class="me-2 data-[orientation=vertical]:h-4" />
    <Breadcrumb.Root>
      <Breadcrumb.List>
        {#each breadcrumbs as breadcrumb, i}
          <Breadcrumb.Item class={i === 0 ? 'hidden md:block' : ''}>
            {#if breadcrumb.isLast}
              <Breadcrumb.Page>{breadcrumb.label}</Breadcrumb.Page>
            {:else}
              <Breadcrumb.Link href={breadcrumb.href}>{breadcrumb.label}</Breadcrumb.Link>
            {/if}
          </Breadcrumb.Item>
          {#if !breadcrumb.isLast}
            <Breadcrumb.Separator class="hidden md:block" />
          {/if}
        {/each}
      </Breadcrumb.List>
    </Breadcrumb.Root>
  </div>
</header>
