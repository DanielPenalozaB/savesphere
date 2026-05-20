<script lang="ts">
  import { resolve } from '$app/paths';
  import { page } from '$app/state';
  import * as Sidebar from '$lib/components/ui/sidebar/index.js';
  import { m } from '$lib/paraglide/messages.js';
  import { localizeHref } from '$lib/paraglide/runtime';
  import { toLocalizedPath } from '$lib/utils';
  import {
    ArrowLeftRight,
    BanknoteArrowDown,
    BrainCircuit,
    CalendarSync,
    FingerprintPattern,
    FlagTriangleRight,
    GitFork,
    HardDriveDownload,
    LayoutDashboard,
    LifeBuoyIcon,
    Lightbulb,
    SendIcon,
    TrendingUpDown,
    Wallet
  } from '@lucide/svelte';
  import CommandIcon from '@lucide/svelte/icons/command';
  import type { ComponentProps } from 'svelte';
  import NavGroup from './layout/nav-group.svelte';
  import NavSecondary from './navigation/nav-secondary.svelte';
  import NavUser from './navigation/nav-user.svelte';
  import { authState } from '$lib/auth.svelte.js';

  let { ref = $bindable(null), ...restProps }: ComponentProps<typeof Sidebar.Root> = $props();

  const currentPath = $derived(page.url.pathname);

  function isActive(url: string): boolean {
    const resolved = resolve(toLocalizedPath(url));
    return currentPath === resolved;
  }

  const data = $derived({
    navMain: [
      {
        title: m.sidebar_nav_dashboard(),
        url: localizeHref('/'),
        icon: LayoutDashboard,
        isActive: isActive('/')
      },
      {
        title: m.sidebar_nav_wallets(),
        url: localizeHref('/wallets'),
        icon: Wallet,
        isActive: isActive('/wallets'),
        items: [
          {
            title: m.sidebar_nav_active_accounts(),
            url: localizeHref('/wallets/active-accounts')
          },
          {
            title: m.sidebar_nav_currencies_exchange(),
            url: localizeHref('/wallets/currencies-exchange')
          }
        ]
      },
      {
        title: m.sidebar_nav_transactions(),
        url: localizeHref('/transactions'),
        icon: ArrowLeftRight,
        isActive: isActive('/transactions'),
        items: [
          {
            title: m.sidebar_nav_bills(),
            url: localizeHref('/transactions/bills')
          },
          {
            title: m.sidebar_nav_history(),
            url: localizeHref('/transactions/history')
          },
          {
            title: m.sidebar_nav_categories(),
            url: localizeHref('/transactions/categories')
          }
        ]
      }
    ],
    intelligence: [
      {
        title: m.sidebar_nav_financial_coach(),
        url: localizeHref('/intelligence/financial-coach'),
        icon: BrainCircuit,
        isActive: isActive('/intelligence/financial-coach')
      },
      {
        title: m.sidebar_nav_temporal_reports(),
        url: localizeHref('/intelligence/temporal-reports'),
        icon: FlagTriangleRight,
        isActive: isActive('/intelligence/temporal-reports')
      },
      {
        title: m.sidebar_nav_insights(),
        url: localizeHref('/intelligence/insights'),
        icon: Lightbulb,
        isActive: isActive('/intelligence/insights')
      }
    ],
    planning: [
      {
        title: m.sidebar_nav_safe_to_spend(),
        url: localizeHref('/planning/safe-to-spend'),
        icon: BanknoteArrowDown,
        isActive: isActive('/planning/safe-to-spend')
      },
      {
        title: m.sidebar_nav_subscriptions(),
        url: localizeHref('/planning/subscriptions'),
        icon: CalendarSync,
        isActive: isActive('/planning/subscriptions')
      },
      {
        title: m.sidebar_nav_simulations(),
        url: localizeHref('/planning/simulations'),
        icon: TrendingUpDown,
        isActive: isActive('/planning/simulations')
      }
    ],
    management: [
      {
        title: m.sidebar_nav_taxonomy(),
        url: localizeHref('/management/taxonomy'),
        icon: GitFork,
        isActive: isActive('/management/taxonomy')
      },
      {
        title: m.sidebar_nav_data_exports(),
        url: localizeHref('/management/data-exports'),
        icon: HardDriveDownload,
        isActive: isActive('/management/data-exports')
      },
      {
        title: m.sidebar_nav_security_privacy(),
        url: localizeHref('/management/security-privacy'),
        icon: FingerprintPattern,
        isActive: isActive('/management/security-privacy')
      }
    ],
    navSecondary: [
      {
        title: m.sidebar_nav_support(),
        url: localizeHref('/support'),
        icon: LifeBuoyIcon
      },
      {
        title: m.sidebar_nav_feedback(),
        url: localizeHref('/feedback'),
        icon: SendIcon
      }
    ],
    user: authState.user
  });
</script>

<Sidebar.Root bind:ref variant="inset" {...restProps}>
  <Sidebar.Header>
    <Sidebar.Menu>
      <Sidebar.MenuItem>
        <Sidebar.MenuButton size="lg">
          {#snippet child({ props })}
            <a href={resolve(toLocalizedPath('/'))} {...props}>
              <div
                class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"
              >
                <CommandIcon class="size-4" aria-hidden="true" />
              </div>
              <div class="grid flex-1 text-start text-sm leading-tight">
                <span class="truncate font-medium">{m.sidebar_app_name()}</span>
                <span class="truncate text-xs">{m.sidebar_app_description()}</span>
              </div>
            </a>
          {/snippet}
        </Sidebar.MenuButton>
      </Sidebar.MenuItem>
    </Sidebar.Menu>
  </Sidebar.Header>
  <Sidebar.Content>
    <NavGroup label={m.sidebar_group_overview()} items={data.navMain} />
    <NavGroup label={m.sidebar_nav_intelligence_ai()} items={data.intelligence} />
    <NavGroup label={m.sidebar_nav_planning()} items={data.planning} />
    <NavGroup label={m.sidebar_nav_management()} items={data.management} />
    <NavSecondary items={data.navSecondary} class="mt-auto" />
  </Sidebar.Content>
  <Sidebar.Footer>
    <NavUser user={data.user} />
  </Sidebar.Footer>
</Sidebar.Root>
