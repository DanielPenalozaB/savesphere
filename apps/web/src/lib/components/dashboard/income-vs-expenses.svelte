<script lang="ts">
  import { Info } from '@lucide/svelte';
  import { BarChart } from 'layerchart';
  import * as DashboardCard from './dashboard-card';

  const data = [
    {
      month: 'January',
      Income: 3840,
      Expenses: 1920,
      Savings: 960
    },
    {
      month: 'February',
      Income: 3840,
      Expenses: 1920,
      Savings: 960
    },
    {
      month: 'March',
      Income: 3840,
      Expenses: 1920,
      Savings: 960
    },
    {
      month: 'April',
      Income: 3840,
      Expenses: 1920,
      Savings: 960
    },
    {
      month: 'May',
      Income: 3840,
      Expenses: 1920,
      Savings: 960
    },
    {
      month: 'June',
      Income: 3840,
      Expenses: 1920,
      Savings: 960
    }
  ];
</script>

<DashboardCard.Root>
  <DashboardCard.Content>
    <div class="flex items-start justify-between">
      <div class="flex flex-col">
        <DashboardCard.Title>
          Income vs Expenses
        </DashboardCard.Title>
        <DashboardCard.Description>Last 4 months</DashboardCard.Description>
      </div>
    <button class="text-slate-500 transition-colors hover:text-white">
      <Info class="size-5" />
    </button>
  </div>
  <div
    class="[&_.lc-axis-tick-label]:fill-muted-foreground [&_.lc-axis-tick-label]:stroke-transparent dark:[&_.lc-axis-tick-label]:fill-white [&_.lc-bar]:stroke-transparent [&_.lc-bar]:stroke-0 [&_.lc-legend-swatch-label]:text-muted-foreground dark:[&_.lc-legend-swatch-label]:text-white [&_text]:stroke-transparent"
  >
    <BarChart
      {data}
      x="month"
      series={[
        {
          key: 'Income',
          color: 'var(--color-indigo-500)'
        },
        {
          key: 'Expenses',
          color: 'var(--color-violet-500)'
        },
        {
          key: 'Savings',
          color: 'var(--color-purple-500)'
        }
      ]}
      seriesLayout="group"
      props={{
        xAxis: { format: 'none' },
        yAxis: { format: 'metric' },
        tooltip: {
          header: { format: 'none' }
        }
      }}
      legend
      height={300}
      groupPadding={0.2}
    />
  </div>
  </DashboardCard.Content>
</DashboardCard.Root>
