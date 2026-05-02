<script lang="ts">
  import Button from '$lib/components/ui/button/button.svelte';
  import {
    columns,
    DataTable,
    WalletCurrencyEnum,
    WalletStatusEnum,
    WalletTypeEnum,
    type Wallet
  } from '$lib/components/views/wallets';
  import { m } from '$lib/paraglide/messages.js';
  import { TrendingDown, TrendingUp } from '@lucide/svelte';

  const wallets: Wallet[] = [
    {
      id: '1',
      name: 'Visa Platinum',
      type: WalletTypeEnum.CREDIT,
      balance: '45200.50',
      isPrimary: true,
      status: WalletStatusEnum.ACTIVE,
      currency: WalletCurrencyEnum.USD
    },
    {
      id: '2',
      name: 'Savings Account',
      type: WalletTypeEnum.SAVINGS,
      balance: '12000.00',
      isPrimary: false,
      status: WalletStatusEnum.ACTIVE,
      currency: WalletCurrencyEnum.USD
    },
    {
      id: '3',
      name: 'Checking Account',
      type: WalletTypeEnum.DEBIT,
      balance: '5000.00',
      isPrimary: false,
      status: WalletStatusEnum.ACTIVE,
      currency: WalletCurrencyEnum.USD
    }
  ];
</script>

<svelte:head>
  <title>SaveSphere | {m.sidebar_nav_wallets()}</title>
</svelte:head>

<div class="flex w-full overflow-hidden">
  <main class="flex flex-1 flex-col gap-4">
    <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
      <div class="rounded-md bg-slate-100 p-5 dark:bg-slate-900">
        <p class="mb-1 text-xs font-medium tracking-wider text-slate-500 uppercase">
          Liquid Assets
        </p>
        <div class="flex items-end justify-between">
          <h3 class="text-2xl font-bold tracking-tight">$124,500.00</h3>
          <span
            class="mb-1 flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-500"
          >
            <span class="mr-0.5"><TrendingUp class="size-4" /></span> 2.4%
          </span>
        </div>
      </div>
      <div class="rounded-md bg-slate-100 p-5 dark:bg-slate-900">
        <p class="mb-1 text-xs font-medium tracking-wider text-slate-500 uppercase">Total Debt</p>
        <div class="flex items-end justify-between">
          <h3 class="text-2xl font-bold tracking-tight">-$12,400.00</h3>
          <span
            class="mb-1 flex items-center rounded-full bg-orange-500/10 px-2 py-0.5 text-xs font-bold text-orange-500"
          >
            <span class="mr-0.5"><TrendingDown class="size-4" /></span> 0.5%
          </span>
        </div>
      </div>
      <div class="rounded-md bg-slate-100 p-5 dark:bg-slate-900">
        <p class="mb-1 text-xs font-medium tracking-wider text-slate-500 uppercase">Net Worth</p>
        <div class="flex items-end justify-between">
          <h3 class="text-2xl font-bold tracking-tight">$112,100.00</h3>
          <span
            class="mb-1 flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-500"
          >
            <span class="mr-0.5"><TrendingUp class="size-4" /></span> 3.1%
          </span>
        </div>
      </div>
    </div>
    <div class="flex flex-col gap-4">
      <Button
        class="w-fit bg-indigo-500 text-sm font-medium text-white hover:bg-indigo-600 dark:bg-indigo-800 dark:hover:bg-indigo-700"
      >
        Add Wallet
      </Button>
      <DataTable data={wallets} {columns} />
    </div>
  </main>
</div>
