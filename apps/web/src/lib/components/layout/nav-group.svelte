<script lang="ts">
  import * as Collapsible from '$lib/components/ui/collapsible/index.js';
  import * as Sidebar from '$lib/components/ui/sidebar/index.js';
  import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
  import { resolve } from '$app/paths';
  import { page } from '$app/state';
  import { toPath } from '$lib/utils';
  import { m } from '$lib/paraglide/messages.js';

  let {
    label,
    items
  }: {
    label: string;
    items: {
      title: string;
      url: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      icon?: any;
      isActive?: boolean;
      items?: { title: string; url: string }[];
    }[];
  } = $props();
</script>

<Sidebar.Group>
  <Sidebar.GroupLabel>{label}</Sidebar.GroupLabel>
  <Sidebar.Menu>
    {#each items as mainItem (mainItem.title)}
      <Collapsible.Root open={mainItem.isActive}>
        {#snippet child({ props })}
          <Sidebar.MenuItem {...props}>
            <Sidebar.MenuButton tooltipContent={mainItem.title}>
              {#snippet child({ props })}
                <a
                  href={resolve(toPath(mainItem.url))}
                  {...props}
                  aria-current={mainItem.isActive ? 'page' : undefined}
                >
                  {#if mainItem.icon}
                    <mainItem.icon aria-hidden="true" />
                  {/if}
                  <span>{mainItem.title}</span>
                </a>
              {/snippet}
            </Sidebar.MenuButton>
            {#if mainItem.items?.length}
              <Collapsible.Trigger>
                {#snippet child({ props })}
                  <Sidebar.MenuAction {...props} class="data-[state=open]:rotate-90">
                    <ChevronRightIcon aria-hidden="true" />
                    <span class="sr-only"
                      >{m.sidebar_toggle_submenu({ title: mainItem.title })}</span
                    >
                  </Sidebar.MenuAction>
                {/snippet}
              </Collapsible.Trigger>
              <Collapsible.Content>
                <Sidebar.MenuSub>
                  {#each mainItem.items as subItem (subItem.title)}
                    <Sidebar.MenuSubItem>
                      <Sidebar.MenuSubButton
                        href={resolve(toPath(subItem.url))}
                        aria-current={page.url.pathname === resolve(toPath(subItem.url))
                          ? 'page'
                          : undefined}
                      >
                        <span>{subItem.title}</span>
                      </Sidebar.MenuSubButton>
                    </Sidebar.MenuSubItem>
                  {/each}
                </Sidebar.MenuSub>
              </Collapsible.Content>
            {/if}
          </Sidebar.MenuItem>
        {/snippet}
      </Collapsible.Root>
    {/each}
  </Sidebar.Menu>
</Sidebar.Group>
