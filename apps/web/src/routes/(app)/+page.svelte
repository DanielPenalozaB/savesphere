<script lang="ts">
  import {
    IncomeVsExpenses,
    PasswordSetupBanner,
    SafeToSpendChart,
    TransactionList,
    UpcomingBills,
    WalletCard
  } from '$lib/components/views/dashboard';
  import { m } from '$lib/paraglide/messages.js';
  import { notify } from '$lib/components/ui/toast';
  import TrendingUp from '@lucide/svelte/icons/trending-up';

  let { data } = $props();
</script>

<svelte:head>
  <title>SaveSphere | {m.sidebar_nav_dashboard()}</title>
</svelte:head>

<div class="flex w-full overflow-hidden">
  <!-- Main Content -->
  <main class="flex flex-1 flex-col gap-4">
    <PasswordSetupBanner />

    <!-- TEMP: Toast test triggers -->
    <section class="rounded-xl border bg-card p-4 shadow-sm">
      <h2 class="mb-3 text-sm font-semibold text-muted-foreground">Toast System Test</h2>
      <div class="flex flex-wrap gap-2">
        <button
          class="rounded-full bg-green-500/10 px-3 py-1.5 text-xs font-medium text-green-600 hover:bg-green-500/20"
          onclick={() =>
            notify.success({
              title: 'Success toast',
              description: 'This is a description that will expand.',
              duration: 180000,
              expanded: true
            })}
        >
          Success
        </button>
        <button
          class="rounded-full bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-500/20"
          onclick={() => notify.error('Error toast', 'Something went wrong. Here are the details.')}
        >
          Error
        </button>
        <button
          class="rounded-full bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-600 hover:bg-amber-500/20"
          onclick={() =>
            notify.warning('Warning toast', 'Please review your input before continuing.')}
        >
          Warning
        </button>
        <button
          class="rounded-full bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-500/20"
          onclick={() => notify.info('Info toast', 'Just letting you know what is happening.')}
        >
          Info
        </button>
        <button
          class="rounded-full bg-gray-500/10 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-500/20"
          onclick={() =>
            notify.promise(new Promise((resolve) => setTimeout(resolve, 2000)), {
              loading: 'Loading...',
              success: 'Done!',
              error: 'Failed!'
            })}
        >
          Promise (2s)
        </button>
        <button
          class="rounded-full bg-purple-500/10 px-3 py-1.5 text-xs font-medium text-purple-600 hover:bg-purple-500/20"
          onclick={() =>
            notify.success({
              title: 'Expanded toast',
              description: 'This description is visible immediately.',
              expanded: true,
              duration: 8000
            })}
        >
          Expanded Default
        </button>
        <button
          class="rounded-full bg-pink-500/10 px-3 py-1.5 text-xs font-medium text-pink-600 hover:bg-pink-500/20"
          onclick={() =>
            notify.success({
              title: 'Collapsed toast',
              description: 'Hover me to see this description.',
              expanded: false,
              duration: 8000
            })}
        >
          Collapsed Default
        </button>
      </div>
    </section>

    <div class="mb-4 flex items-end gap-4">
      <h1 class="text-6xl font-bold tracking-tighter dark:text-white">
        {data.totalBalanceDisplay}
      </h1>
      <div class="flex items-center gap-2">
        <div
          class="flex items-center gap-2 rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-500 ring-1 ring-green-500/20 ring-inset"
        >
          <TrendingUp class="size-4" aria-hidden="true" />
          + {data.monthlyTrend}%
        </div>
        <span class="text-xs font-medium text-slate-400">from last month</span>
      </div>
    </div>

    <!-- Wallets Section -->
    <section class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {#each data.wallets as wallet (wallet.id)}
        <WalletCard
          type={wallet.name}
          accountNumber={wallet.id}
          balance={`$${Number.parseFloat(wallet.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          isPrimary={wallet.isPrimary}
          icon={wallet.type === 'credit' ? 'card' : 'savings'}
        />
      {/each}
    </section>

    <!-- Charts & Transactions -->
    <section class="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <IncomeVsExpenses />
      <UpcomingBills />
      <SafeToSpendChart />
      <TransactionList />
    </section>
  </main>
</div>
