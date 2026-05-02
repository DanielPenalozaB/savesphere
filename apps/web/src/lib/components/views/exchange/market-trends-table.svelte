<script lang="ts">
  import { TrendingUp } from '@lucide/svelte';
  import type { MarketTrend } from '$lib/types/currency.js';

  let { trends }: { trends: MarketTrend[] } = $props();
</script>

<div class="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100/50 backdrop-blur-sm">
  <table class="w-full border-collapse text-left">
    <thead>
      <tr class="border-b border-white/5 bg-white/5">
        <th class="px-6 py-4 text-xs font-bold tracking-widest text-slate-400 uppercase">Pair</th>
        <th class="px-6 py-4 text-xs font-bold tracking-widest text-slate-400 uppercase">
          Last Price
        </th>
        <th class="px-6 py-4 text-xs font-bold tracking-widest text-slate-400 uppercase">Trend</th>
        <th class="px-6 py-4 text-right text-xs font-bold tracking-widest text-slate-400 uppercase">
          Change (24h)
        </th>
      </tr>
    </thead>
    <tbody class="divide-y divide-white/5">
      {#each trends as trend}
        <tr class="transition-colors hover:bg-white/5">
          <td class="px-6 py-4 font-bold">{trend.pair}</td>
          <td class="px-6 py-4 text-slate-300">{trend.lastPrice}</td>
          <td class="px-6 py-4">
            <div
              class="relative flex h-8 w-24 items-center justify-center overflow-hidden rounded-lg {trend.isPositive
                ? 'bg-emerald-500/10'
                : 'bg-rose-500/10'}"
            >
              <div
                class="absolute inset-0 bg-linear-to-r to-transparent {trend.isPositive
                  ? 'from-emerald-500/20'
                  : 'from-rose-500/20'}"
              ></div>
              <TrendingUp
                class="size-4 {trend.isPositive
                  ? 'text-emerald-500'
                  : 'rotate-180 text-rose-500'}"
              />
            </div>
          </td>
          <td
            class="px-6 py-4 text-right font-bold {trend.isPositive
              ? 'text-emerald-500'
              : 'text-rose-500'}"
          >
            {trend.change}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
