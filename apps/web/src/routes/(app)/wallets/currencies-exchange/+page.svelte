<script lang="ts">
  import Button from '$lib/components/ui/button/button.svelte';
  import { History, Plus, CircleDollarSign, TrendingUp } from '@lucide/svelte';
  import CurrencyCard from '$lib/components/views/exchange/currency-card.svelte';
  import MarketTrendsTable from '$lib/components/views/exchange/market-trends-table.svelte';
  import ExchangeCalculator from '$lib/components/views/exchange/exchange-calculator.svelte';

  let { data } = $props();
</script>

<svelte:head>
  <title>SaveSphere | Currencies & Exchange</title>
</svelte:head>

<div class="flex w-full overflow-hidden">
  <main class="relative flex flex-1 flex-col gap-4">
    <div class="relative z-10">
      <!-- Header -->
      <header class="mb-8 flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 class="mb-2 text-2xl font-bold tracking-tight">Currencies & Exchanges</h1>
          <p class="text-sm text-slate-400">
            Manage your global liquid assets and real-time conversions.
          </p>
        </div>
        <div class="flex gap-3">
          <Button
            variant="outline"
            class="flex items-center gap-2 border border-white/10 bg-slate-100 px-5 py-2.5 font-semibold transition-all hover:bg-white/10"
          >
            <History class="size-4" aria-hidden="true" />
            Activity
          </Button>
          <Button
            class="flex items-center gap-2 bg-indigo-600 px-5 py-2.5 font-semibold text-white shadow-xl shadow-indigo-600/20 transition-all hover:bg-indigo-500"
          >
            <Plus class="size-4" aria-hidden="true" />
            Add Currency
          </Button>
        </div>
      </header>

      <!-- Main Grid -->
      <div class="grid grid-cols-12 gap-8">
        <!-- Left Column: Currency Selection & Market Trends -->
        <div class="col-span-12 space-y-8 lg:col-span-7">
          <!-- Currency Selection -->
          <section>
            <h2 class="mb-5 flex items-center gap-2 text-xl font-bold">
              <CircleDollarSign class="size-5 text-indigo-500" />
              Select Currency
            </h2>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {#each data.currencies as currency}
                <CurrencyCard {currency} />
              {/each}
            </div>
          </section>

          <!-- Market Trends -->
          <section>
            <h2 class="mb-5 flex items-center gap-2 text-xl font-bold">
              <TrendingUp class="size-5 text-indigo-500" />
              Market Trends
            </h2>
            <MarketTrendsTable trends={data.marketTrends} />
          </section>
        </div>

        <!-- Right Column: Exchange Calculator -->
        <div class="col-span-12 lg:col-span-5">
          <ExchangeCalculator currencies={data.currencies} exchangeRate={data.exchangeRate} />
        </div>
      </div>
    </div>
  </main>
</div>
