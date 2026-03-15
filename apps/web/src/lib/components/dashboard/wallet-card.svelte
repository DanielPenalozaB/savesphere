<script lang="ts">
  import { cn } from '$lib/utils';
  import CreditCard from '@lucide/svelte/icons/credit-card';
  import PiggyBank from '@lucide/svelte/icons/piggy-bank';
  import * as DashboardCard from './dashboard-card';

  let {
    type = 'Visa Platinum',
    accountNumber = '8829',
    balance = '$45,200.50',
    isPrimary = true,
    apy = undefined,
    icon = 'card'
  } = $props();
</script>

<DashboardCard.Root
  class={cn(
    'relative justify-between gap-2 p-4',
    isPrimary &&
      'border-2 border-indigo-300 bg-linear-to-br from-indigo-50 to-indigo-200 dark:border-indigo-900 dark:from-indigo-900 dark:to-indigo-950'
  )}
>
  <div class="flex items-start justify-between">
    <div>
      <h3 class="text-sm font-semibold text-slate-600 dark:text-slate-400">{type}</h3>
      <p class="mt-1 text-sm font-medium text-slate-400">
        {icon === 'card' ? '•••• ' : 'Acc: '}
        {accountNumber}
      </p>
    </div>

    <div
      class="rounded-sm bg-slate-300/50 p-3 text-slate-500 backdrop-blur-lg dark:bg-slate-600/20 dark:text-slate-400"
    >
      {#if icon === 'card'}
        <CreditCard class="size-6 opacity-80" />
      {:else if icon === 'savings'}
        <PiggyBank class="size-6 opacity-80" />
      {/if}
    </div>
  </div>

  <div class="flex items-end justify-between">
    <div>
      <p
        class="mb-2 text-[10px] font-bold tracking-widest text-slate-400 uppercase dark:text-slate-500"
      >
        Current Balance
      </p>
      <p class="text-3xl font-bold tracking-tight text-slate-600 dark:text-white">{balance}</p>
    </div>

    {#if isPrimary}
      <span
        class="rounded-lg bg-indigo-300 px-3 py-1 text-[10px] font-semibold tracking-widest text-white uppercase dark:bg-white/10 dark:text-white"
        >Primary</span
      >
    {:else if apy}
      <span
        class="rounded-lg bg-green-500/10 px-3 py-1 text-[10px] font-bold tracking-widest text-green-500 uppercase"
        >{apy} APY</span
      >
    {/if}
  </div>
</DashboardCard.Root>
