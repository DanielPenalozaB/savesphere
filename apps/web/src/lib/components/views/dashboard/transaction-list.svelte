<script lang="ts">
  import Apple from '@lucide/svelte/icons/apple';
  import ShoppingBag from '@lucide/svelte/icons/shopping-bag';
  import Utensils from '@lucide/svelte/icons/utensils';
  import Play from '@lucide/svelte/icons/play';
  import Wallet from '@lucide/svelte/icons/wallet';
  import * as DashboardCard from './dashboard-card';
  import SpendingSummary from './spending-summary.svelte';

  const transactions = [
    {
      id: 1,
      name: 'Apple Store',
      category: 'Electronics',
      date: 'Oct 24, 2023',
      amount: '-$999.00',
      icon: ShoppingBag,
      color: 'text-purple-500 bg-purple-500/10',
      wallet: 'Visa Platinum'
    },
    {
      id: 2,
      name: 'Salary Deposit',
      category: 'Income',
      date: 'Oct 23, 2023',
      amount: '+$5,400.00',
      icon: Wallet,
      color: 'text-green-500 bg-green-500/10',
      wallet: 'Savings Account'
    },
    {
      id: 3,
      name: 'The Golden Grill',
      category: 'Dining',
      date: 'Oct 22, 2023',
      amount: '-$42.50',
      icon: Utensils,
      color: 'text-orange-500 bg-orange-500/10',
      wallet: 'Visa Platinum'
    },
    {
      id: 4,
      name: 'Netflix Subscription',
      category: 'Entertainment',
      date: 'Oct 21, 2023',
      amount: '-$15.99',
      icon: Play,
      color: 'text-blue-500 bg-blue-500/10',
      wallet: 'Visa Platinum'
    }
  ];
</script>

<DashboardCard.Root>
  <SpendingSummary />
  <DashboardCard.Content>
    <div class="flex items-center justify-between">
      <DashboardCard.Title>Recent Transactions</DashboardCard.Title>
      <button
        class="text-xs font-bold tracking-widest text-blue-500 uppercase transition-colors hover:text-blue-400"
        >View All</button
      >
    </div>
    <div class="space-y-6">
      {#each transactions as tx}
        <div class="group flex cursor-pointer items-center justify-between">
          <div class="flex items-center gap-5">
            <div
              class="flex size-10 items-center justify-center rounded-lg transition-transform group-hover:scale-110 {tx.color}"
            >
              <tx.icon class="size-6" />
            </div>
            <div>
              <h4 class="text-sm font-semibold tracking-normal text-slate-600 dark:text-white">
                {tx.name}
              </h4>
              <p class="mt-1 text-xs font-medium text-slate-400 dark:text-slate-500">
                {tx.category} • {tx.date}
              </p>
            </div>
          </div>
          <div class="flex flex-col items-end justify-center">
            <p
              class="text-sm font-semibold tracking-tight {tx.amount.startsWith('+')
                ? 'text-green-500'
                : 'text-red-500'}"
            >
              {tx.amount}
            </p>
            <span class="text-xs text-slate-400 dark:text-slate-500">{tx.wallet}</span>
          </div>
        </div>
      {/each}
    </div>
  </DashboardCard.Content>
</DashboardCard.Root>
