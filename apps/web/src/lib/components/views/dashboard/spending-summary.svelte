<script lang="ts">
  import * as DashboardCard from './dashboard-card';

  const categories = [
    { name: 'Fixed', percentage: 40, color: 'bg-indigo-300' },
    { name: 'Variable', percentage: 20, color: 'bg-amber-200' },
    { name: 'Savings', percentage: 20, color: 'bg-emerald-300' },
    { name: 'Others', percentage: 20, color: 'bg-slate-400' }
  ];
</script>

<DashboardCard.Header>
  <div class="flex items-start justify-between gap-6">
    <DashboardCard.Title>Monthly Spending Summary</DashboardCard.Title>
    <div class="flex items-center gap-2">
      <div class="flex flex-col items-end">
        <span
          class="text-[10px] font-semibold tracking-widest text-slate-400 uppercase dark:text-slate-500"
        >
          Total Spent
        </span>
        <span class="text-sm font-medium tracking-tighter text-red-500">$2.000.000</span>
      </div>
      <div class="flex flex-col items-end">
        <span
          class="text-[10px] font-semibold tracking-widest text-slate-400 uppercase dark:text-slate-500"
        >
          Saving Rate
        </span>
        <span class="text-sm font-medium tracking-tighter text-green-500">35%</span>
      </div>
    </div>
  </div>
  <div class="flex flex-col gap-2">
    <div class="flex items-center gap-2">
      {#each categories as cat}
        <span class="h-1.5 rounded-full {cat.color}" style="width: {cat.percentage}%"></span>
      {/each}
    </div>
    <div class="flex flex-wrap items-center gap-4">
      {#each categories as cat}
        <div class="flex items-center gap-2">
          <span class="size-2 rounded-full {cat.color}"></span>
          <span
            class="text-[10px] font-semibold tracking-widest text-slate-500 uppercase dark:text-slate-400"
          >
            {cat.name} ({cat.percentage}%)
          </span>
        </div>
      {/each}
    </div>
  </div>
</DashboardCard.Header>
