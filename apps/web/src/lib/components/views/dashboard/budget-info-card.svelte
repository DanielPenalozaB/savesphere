<script lang="ts">
  import { ChartLine } from '@lucide/svelte';
</script>

<div
  class="flex items-center gap-6 rounded-md border border-slate-200 bg-white p-4 dark:border-slate-600 dark:bg-slate-800"
>
  <div class="rounded-sm bg-indigo-100 p-3 text-indigo-600 dark:bg-indigo-700 dark:text-indigo-200">
    <ChartLine class="size-6 opacity-80" />
  </div>
  <div class="flex flex-col text-sm">
    <span class="font-bold text-slate-600 dark:text-slate-200">Story Update</span>
    <span class="leading-tight font-normal tracking-tight text-slate-400"
      >You're currently <strong class="font-medium text-indigo-400">under-budget</strong> by $500k. At
      this rate, you'll reach your $2.000.000 savings goal.</span
    >
  </div>
</div>
