<script lang="ts">
  import BadgeCheckIcon from '@lucide/svelte/icons/badge-check';
  import BellIcon from '@lucide/svelte/icons/bell';
  import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
  import LogOutIcon from '@lucide/svelte/icons/log-out';
  import SunMoon from '@lucide/svelte/icons/sun-moon';

  import * as Avatar from '$lib/components/ui/avatar/index.js';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
  import * as Sidebar from '$lib/components/ui/sidebar/index.js';
  import { useSidebar } from '$lib/components/ui/sidebar/index.js';
  import FingerprintPattern from '@lucide/svelte/icons/fingerprint-pattern';
  import Globe from '@lucide/svelte/icons/globe';
  import Switch from '../ui/switch/switch.svelte';
  import { m } from '$lib/paraglide/messages.js';
  import { setLocale } from '$lib/paraglide/runtime';
  import { themeState } from '$lib/theme.svelte';

  let {
    user
  }: {
    user: {
      name: string;
      email: string;
      avatar: string;
    };
  } = $props();

  const sidebar = useSidebar();
</script>

<Sidebar.Menu>
  <Sidebar.MenuItem>
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        {#snippet child({ props })}
          <Sidebar.MenuButton
            {...props}
            size="lg"
            class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <Avatar.Root class="size-8 rounded-lg">
              <Avatar.Image src={user.avatar} alt={user.name} />
              <Avatar.Fallback class="rounded-lg">CN</Avatar.Fallback>
            </Avatar.Root>
            <div class="grid flex-1 text-start text-sm leading-tight">
              <span class="truncate font-medium">{user.name}</span>
              <span class="truncate text-xs">{user.email}</span>
            </div>
            <ChevronsUpDownIcon class="ms-auto size-4" />
          </Sidebar.MenuButton>
        {/snippet}
      </DropdownMenu.Trigger>
      <DropdownMenu.Content
        class="w-(--bits-dropdown-menu-anchor-width) min-w-56 rounded-lg"
        side={sidebar.isMobile ? 'bottom' : 'right'}
        align="end"
        sideOffset={4}
      >
        <DropdownMenu.Label class="p-0 font-normal">
          <div class="flex items-center gap-2 px-1 py-1.5 text-start text-sm">
            <Avatar.Root class="size-8 rounded-lg">
              <Avatar.Image src={user.avatar} alt={user.name} />
              <Avatar.Fallback class="rounded-lg">CN</Avatar.Fallback>
            </Avatar.Root>
            <div class="grid flex-1 text-start text-sm leading-tight">
              <span class="truncate font-medium">{user.name}</span>
              <span class="truncate text-xs">{user.email}</span>
            </div>
          </div>
        </DropdownMenu.Label>
        <DropdownMenu.Separator />
        <DropdownMenu.Group>
          <DropdownMenu.Item>
            <BadgeCheckIcon />
            {m.sidebar_user_account()}
          </DropdownMenu.Item>
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger>
              <SunMoon />
              {m.sidebar_user_theme()}
            </DropdownMenu.SubTrigger>
            <DropdownMenu.SubContent>
              <DropdownMenu.Item onclick={() => themeState.setTheme('light')}
                >{m.sidebar_user_theme_light()}</DropdownMenu.Item
              >
              <DropdownMenu.Item onclick={() => themeState.setTheme('dark')}
                >{m.sidebar_user_theme_dark()}</DropdownMenu.Item
              >
              <DropdownMenu.Item onclick={() => themeState.setTheme('system')}
                >{m.sidebar_user_theme_system()}</DropdownMenu.Item
              >
            </DropdownMenu.SubContent>
          </DropdownMenu.Sub>
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger>
              <Globe />
              {m.sidebar_user_language()}
            </DropdownMenu.SubTrigger>
            <DropdownMenu.SubContent>
              <DropdownMenu.Item onclick={() => setLocale('en')}
                >{m.sidebar_user_language_en()}</DropdownMenu.Item
              >
              <DropdownMenu.Item onclick={() => setLocale('es')}
                >{m.sidebar_user_language_es()}</DropdownMenu.Item
              >
            </DropdownMenu.SubContent>
          </DropdownMenu.Sub>
          <DropdownMenu.Item
            class="flex items-center justify-between"
            onSelect={(e) => e.preventDefault()}
          >
            <div class="flex items-center gap-2">
              <FingerprintPattern />
              {m.sidebar_user_privacy()}
            </div>
            <Switch />
          </DropdownMenu.Item>
          <DropdownMenu.Item>
            <BellIcon />
            {m.sidebar_user_notifications()}
          </DropdownMenu.Item>
        </DropdownMenu.Group>
        <DropdownMenu.Separator />
        <DropdownMenu.Item>
          <LogOutIcon />
          {m.sidebar_user_logout()}
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  </Sidebar.MenuItem>
</Sidebar.Menu>
