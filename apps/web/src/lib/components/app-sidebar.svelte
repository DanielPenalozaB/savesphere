<script lang="ts">
  import { resolve } from '$app/paths';
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
  import NavIntelligence from './navigation/nav-intelligence.svelte';
  import NavMain from './navigation/nav-main.svelte';
  import NavManagement from './navigation/nav-management.svelte';
  import NavPlanning from './navigation/nav-planning.svelte';
  import NavSecondary from './navigation/nav-secondary.svelte';
  import NavUser from './navigation/nav-user.svelte';

  let { ref = $bindable(null), ...restProps }: ComponentProps<typeof Sidebar.Root> = $props();

  const data = $derived({
    navMain: [
      {
        title: m.sidebar_nav_dashboard(),
        url: localizeHref('/'),
        icon: LayoutDashboard
      },
      {
        title: m.sidebar_nav_wallets(),
        url: localizeHref('/wallets'),
        icon: Wallet,
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
        icon: BrainCircuit
      },
      {
        title: m.sidebar_nav_temporal_reports(),
        url: localizeHref('/intelligence/temporal-reports'),
        icon: FlagTriangleRight
      },
      {
        title: m.sidebar_nav_insights(),
        url: localizeHref('/intelligence/insights'),
        icon: Lightbulb
      }
    ],
    planning: [
      {
        title: m.sidebar_nav_safe_to_spend(),
        url: localizeHref('/planning/safe-to-spend'),
        icon: BanknoteArrowDown
      },
      {
        title: m.sidebar_nav_subscriptions(),
        url: localizeHref('/planning/subscriptions'),
        icon: CalendarSync
      },
      {
        title: m.sidebar_nav_simulations(),
        url: localizeHref('/planning/simulations'),
        icon: TrendingUpDown
      }
    ],
    management: [
      {
        title: m.sidebar_nav_taxonomy(),
        url: localizeHref('/management/taxonomy'),
        icon: GitFork
      },
      {
        title: m.sidebar_nav_data_exports(),
        url: localizeHref('/management/data-exports'),
        icon: HardDriveDownload
      },
      {
        title: m.sidebar_nav_security_privacy(),
        url: localizeHref('/management/security-privacy'),
        icon: FingerprintPattern
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
    user: {
      name: 'Daniel Peñaloza',
      email: 'dpenaloza@savesphere.com',
      avatar: 'https://doodleipsum.com/1200?i=aaae4ac68a7288537c3192c776e5afab'
    }
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
                <CommandIcon class="size-4" />
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
    <NavMain items={data.navMain} />
    <NavIntelligence items={data.intelligence} />
    <NavPlanning items={data.planning} />
    <NavManagement items={data.management} />
    <NavSecondary items={data.navSecondary} class="mt-auto" />
  </Sidebar.Content>
  <Sidebar.Footer>
    <NavUser user={data.user} />
  </Sidebar.Footer>
</Sidebar.Root>
