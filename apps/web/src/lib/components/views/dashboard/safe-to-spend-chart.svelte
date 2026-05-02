<script lang="ts">
  import { Info } from '@lucide/svelte';
  import * as DashboardCard from './dashboard-card';
  import BudgetProgress from './budget-progress.svelte';
  import BudgetInfoCard from './budget-info-card.svelte';

  let { amount = '$2.014.000', total = '$8.014.000', percentage = 75 } = $props();
</script>

<DashboardCard.Root>
  <DashboardCard.Content class="h-full">
    <div class="flex items-start justify-between">
      <div class="flex flex-col">
        <DashboardCard.Title>Monthly Rhythm</DashboardCard.Title>
        <DashboardCard.Description>Tracking your spending speed</DashboardCard.Description>
      </div>
      <button class="text-slate-500 transition-colors hover:text-white">
        <Info class="size-5" />
      </button>
    </div>
    <div
      class="relative mx-auto flex w-full flex-1 items-center justify-center overflow-clip rounded-md bg-slate-200/50 px-10 py-6 dark:bg-slate-950"
    >
      <!-- Center Content -->
      <div class="z-10 flex w-full flex-col gap-6">
        <div class="flex items-end justify-between gap-4">
          <div class="flex flex-col items-start justify-center text-center">
            <span
              class="text-xs font-semibold tracking-widest text-slate-400 uppercase dark:text-slate-500"
            >
              Safe to spend
            </span>
            <span
              class="text-4xl leading-tight font-bold tracking-tighter text-slate-600 dark:text-white"
              >{amount}</span
            >
          </div>
          <div class="flex flex-col items-end justify-center text-center">
            <span
              class="text-xs font-semibold tracking-widest text-slate-400 uppercase dark:text-slate-500"
            >
              Total budget
            </span>
            <span
              class="rounded-md bg-slate-200/20 px-1.5 text-2xl leading-tight font-semibold tracking-tighter text-slate-500 backdrop-blur-sm dark:bg-slate-950/20 dark:text-slate-400"
              >{total}</span
            >
          </div>
        </div>
        <BudgetProgress {percentage} />
      </div>
      <div
        class="absolute bottom-0 z-0 h-2/3 w-full border-t-4 border-indigo-400 bg-linear-to-br from-indigo-100 to-indigo-500 opacity-50 dark:border-indigo-500 dark:from-indigo-600 dark:to-indigo-900"
      ></div>
    </div>
    <BudgetInfoCard />
  </DashboardCard.Content>
</DashboardCard.Root>
