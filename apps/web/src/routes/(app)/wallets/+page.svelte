<script lang="ts">
  import Button from '$lib/components/ui/button/button.svelte';
  import { columns, DataTable } from '$lib/components/views/wallets';
  import { m } from '$lib/paraglide/messages.js';
  import { TrendingDown, TrendingUp } from '@lucide/svelte';

  let { data } = $props();
</script>

<svelte:head>
  <title>SaveSphere | {m.sidebar_nav_wallets()}</title>
</svelte:head>

<div class="flex w-full overflow-hidden">
  <main class="flex flex-1 flex-col gap-4">
    <h1 class="sr-only">{m.sidebar_nav_wallets()}</h1>
    <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
      <div class="rounded-md bg-slate-100 p-5 dark:bg-slate-900">
        <p class="mb-1 text-xs font-medium tracking-wider text-slate-500 uppercase">
          Liquid Assets
        </p>
        <div class="flex items-end justify-between">
          <h2 class="text-2xl font-bold tracking-tight">{data.summary.liquidAssets}</h2>
          <span
            class="mb-1 flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-500"
          >
            <span class="mr-0.5"><TrendingUp class="size-4" aria-hidden="true" /></span>
            {data.summary.liquidAssetsTrend}%
          </span>
        </div>
      </div>
      <div class="rounded-md bg-slate-100 p-5 dark:bg-slate-900">
        <p class="mb-1 text-xs font-medium tracking-wider text-slate-500 uppercase">Total Debt</p>
        <div class="flex items-end justify-between">
          <h2 class="text-2xl font-bold tracking-tight">{data.summary.totalDebt}</h2>
          <span
            class="mb-1 flex items-center rounded-full bg-orange-500/10 px-2 py-0.5 text-xs font-bold text-orange-500"
          >
            <span class="mr-0.5"><TrendingDown class="size-4" aria-hidden="true" /></span>
            {Math.abs(data.summary.totalDebtTrend)}%
          </span>
        </div>
      </div>
      <div class="rounded-md bg-slate-100 p-5 dark:bg-slate-900">
        <p class="mb-1 text-xs font-medium tracking-wider text-slate-500 uppercase">Net Worth</p>
        <div class="flex items-end justify-between">
          <h2 class="text-2xl font-bold tracking-tight">{data.summary.netWorth}</h2>
          <span
            class="mb-1 flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-500"
          >
            <span class="mr-0.5"><TrendingUp class="size-4" aria-hidden="true" /></span>
            {data.summary.netWorthTrend}%
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
      <DataTable data={data.wallets} {columns} />
    </div>
  </main>
</div>
