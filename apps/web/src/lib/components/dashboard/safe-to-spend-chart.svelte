<script lang="ts">
  import { ChartLine, Info } from '@lucide/svelte';
  import * as DashboardCard from './dashboard-card';

  let { amount = '$2.014.000', total = '$8.014.000', percentage = 75 } = $props();

  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const offset = $derived(circumference - (percentage / 100) * circumference);
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
        <div class="flex flex-col gap-4">
          <div class="h-6 w-full overflow-hidden rounded-full bg-indigo-200 dark:bg-indigo-900">
            <div
              class="h-full rounded-full bg-indigo-500 transition-all duration-500"
              style="width: {percentage}%"
            ></div>
          </div>
          <div class="flex items-center justify-between text-sm font-semibold">
            <span class="text-indigo-500 dark:text-indigo-300">75% consumed </span>
            <span class="text-white dark:text-slate-400">12 days left</span>
          </div>
        </div>
      </div>
      <div
        class="absolute bottom-0 z-0 h-2/3 w-full border-t-4 border-indigo-400 bg-linear-to-br from-indigo-100 to-indigo-500 opacity-50 dark:border-indigo-500 dark:from-indigo-600 dark:to-indigo-900"
      ></div>
    </div>
    <div
      class="flex items-center gap-6 rounded-md border border-slate-200 bg-white p-4 dark:border-slate-600 dark:bg-slate-800"
    >
      <div
        class="rounded-sm bg-indigo-100 p-3 text-indigo-600 dark:bg-indigo-700 dark:text-indigo-200"
      >
        <ChartLine class="size-6 opacity-80" />
      </div>
      <div class="flex flex-col text-sm">
        <span class="font-bold text-slate-600 dark:text-slate-200">Story Update</span>
        <span class="leading-tight font-normal tracking-tight text-slate-400"
          >You're currently <strong class="font-medium text-indigo-400">under-budget</strong> by $500k.
          At this rate, you'll reach your $2.000.000 savings goal.</span
        >
      </div>
    </div>
  </DashboardCard.Content>
</DashboardCard.Root>
