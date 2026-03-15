<script lang="ts">
  import { IncomeVsExpenses, SafeToSpendChart, TransactionList, UpcomingBills, WalletCard } from '$lib/components/dashboard';
  import TrendingUp from '@lucide/svelte/icons/trending-up';

  // Sample data
  const wallets = [
    {
      type: 'Visa Platinum',
      accountNumber: '8829',
      balance: '$45,200.50',
      isPrimary: true,
      icon: 'card'
    },
    {
      type: 'High-Yield Savings',
      accountNumber: '0042',
      balance: '$78,391.20',
      isPrimary: false,
      apy: '4.5%',
      icon: 'savings'
    },
    {
      type: 'Physical Cash',
      accountNumber: 'Wallet',
      balance: '$1,000.00',
      isPrimary: false,
      icon: 'savings'
    }
  ];
</script>

<svelte:head>
  <title>SaveSphere | Dashboard</title>
</svelte:head>

<div class="flex w-full overflow-hidden">
  <!-- Main Content -->
  <main class="flex flex-1 flex-col gap-4">
    <div class="mb-4 flex items-end gap-4">
      <h2 class="text-6xl font-bold tracking-tighter dark:text-white">$124,592.00</h2>
      <div class="flex items-center gap-2">
        <div
          class="flex items-center gap-2 rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-500 ring-1 ring-green-500/20 ring-inset"
        >
          <TrendingUp class="size-4" />
          + 3.2%
        </div>
        <span class="text-xs font-medium text-slate-400">from last month</span>
      </div>
    </div>

    <!-- Wallets Section -->
    <section class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {#each wallets as wallet}
        <WalletCard {...wallet} />
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
