<script lang="ts">
  import Button from '$lib/components/ui/button/button.svelte';
  import {
    ArrowDownUp,
    Calculator,
    Check,
    CircleDollarSign,
    History,
    Info,
    Plus,
    TrendingUp
  } from '@lucide/svelte';

  // Currency data
  interface Currency {
    code: string;
    name: string;
    symbol: string;
    balance: string;
    isPrimary: boolean;
    flagUrl: string;
  }

  interface MarketTrend {
    pair: string;
    lastPrice: string;
    change: string;
    isPositive: boolean;
  }

  const currencies: Currency[] = [
    {
      code: 'USD',
      name: 'US Dollar',
      symbol: '$',
      balance: '12,450.00',
      isPrimary: true,
      flagUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuB7WvLvXriR97P7VbfOO9lWxmTS-ykZtPe0LwLqrGavJRXRACTcalm_PwntO5sxNxJVHP8RLk-a8WgOBma-XT-egctCMGSwPd_AcfxNTM6vZalWALwN8McYgQNQk_75wrfRViGh6fpy5dLyhKmivVGCGJlXrbdiTS-yMMFATO7xTUJiwjNQSlDP4bozhCAfx3Gi2gMO8v_yWdtI3NSwPiN7KjxRMvYHYQJfrwr4lmP0uj0rKawlravz5pKU2LiaF9Q7IXwoWal60cTw'
    },
    {
      code: 'EUR',
      name: 'Euro',
      symbol: '€',
      balance: '8,210.00',
      isPrimary: false,
      flagUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuB6xth-dzyOX2CBcn5XvIvJ156jFZKqs3VpdYZHoPDTDLyTzPVZ7qORWnLN0fGnxsTeoRKMDnArGrnJRnqM9cZQ4lmWvGb1c_4oDFgqJMDzF8qj-LNKdFDvh6tLFAlBnRtUedPg_sMn2XFf0wLpQBtl8XmbGKEZvnww8WNmBuPI7u8xVTtJVWX8rLm7Jpf_8r9D65I2-YMnqMrxxf1IENGgGogGrrN6nbSxNlr5NwaL2p3dtQvFkIrZ-TkLZBr9iAbCPrhfT8ZArqEr'
    },
    {
      code: 'GBP',
      name: 'British Pound',
      symbol: '£',
      balance: '4,300.00',
      isPrimary: false,
      flagUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCmIdlSjAXoJPsycbtUr7eH4sbd_ARSlDeXsBgK262Me0aOp5WYJkmad7RFJT1EPeW2Dcqn3Phq5pUP74pe0vp9tsVQ49IRK3fuSD91cqcgdH5QSNDzSh3ASKZzwGaBZoe1qP6Fpfwj0m94EHH_ZwUcWq-Q86otCjtgxODoPUTYw1qr6WPAe1fWIBlIhF9-5jSr9JB-CnqbzqiSVcoQEK-dTFZoS6qz_NY6Wdt-H1vUqqwSKWhs2ef37kQPo2qJevNjxmu_HnAk7Yi7'
    },
    {
      code: 'JPY',
      name: 'Japanese Yen',
      symbol: '¥',
      balance: '1,250,400',
      isPrimary: false,
      flagUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBq6mNa2HrJtSKXs0WJrlyIBU4yKvc8-gfxZzcEu04aiKIYNjropiEhlUMOC26JhNLkft8ZRbK7t2cxv_1T5u6bv_w4mNxCPavU6Z4G4VA6Rw0pWKvzXAoeAKmndogv4KT1P2YsxUm3K6euO4caVNo-yrEEShFzuTuxdaFfxtZfOvBcOmGhaP2Uev1phQ9CfPhGagqgGnnV8h8Yax8VR66w_SFbsqDQl-c_z6ZbJmAX_fKRlLrHE6dfektXziWv-AW6jP2QnxaIcFCU'
    }
  ];

  const marketTrends: MarketTrend[] = [
    { pair: 'USD / EUR', lastPrice: '0.9234', change: '+1.24%', isPositive: true },
    { pair: 'GBP / USD', lastPrice: '1.2645', change: '-0.45%', isPositive: false },
    { pair: 'USD / JPY', lastPrice: '151.22', change: '+0.82%', isPositive: true }
  ];

  let fromAmount = $state('1,000.00');
  let toAmount = $state('923.40');
  let selectedFrom = $state('USD - US Dollar');
  let selectedTo = $state('EUR - Euro');
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
            <History class="size-4" />
            Activity
          </Button>
          <Button
            class="flex items-center gap-2 bg-indigo-600 px-5 py-2.5 font-semibold text-white shadow-xl shadow-indigo-600/20 transition-all hover:bg-indigo-500"
          >
            <Plus class="size-4" />
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
              {#each currencies as currency}
                <div
                  class="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-slate-100/50 p-5 backdrop-blur-sm transition-all hover:border-white/20"
                  class:active-glass={currency.isPrimary}
                >
                  {#if currency.isPrimary}
                    <div class="absolute top-2 right-2 p-2">
                      <Check class="size-5 text-indigo-500" />
                    </div>
                  {/if}
                  <div class="mb-6 flex items-center gap-4">
                    <div
                      class="size-12 rounded-xl border bg-cover bg-center {currency.isPrimary
                        ? 'border-white/20'
                        : 'border-white/10'}"
                      style="background-image: url('{currency.flagUrl}')"
                    ></div>
                    <div>
                      <p class="font-bold">{currency.code} - {currency.name}</p>
                      {#if currency.isPrimary}
                        <p class="text-xs font-semibold tracking-wider text-indigo-400">
                          PRIMARY ACCOUNT
                        </p>
                      {/if}
                    </div>
                  </div>
                  <div class="flex items-end justify-between">
                    <p class="text-xl font-bold">
                      {currency.symbol}{currency.balance}
                    </p>
                    {#if currency.isPrimary}
                      <button
                        class="rounded-lg bg-indigo-500/20 px-3 py-1.5 text-xs font-bold text-indigo-400 opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        MANAGE
                      </button>
                    {:else}
                      <button
                        class="rounded-lg bg-white/5 px-3 py-1.5 text-xs text-slate-300 transition-all hover:bg-white/10 whitespace-nowrap"
                      >
                        SET AS DEFAULT
                      </button>
                    {/if}
                  </div>
                </div>
              {/each}
            </div>
          </section>

          <!-- Market Trends -->
          <section>
            <h2 class="mb-5 flex items-center gap-2 text-xl font-bold">
              <TrendingUp class="size-5 text-indigo-500" />
              Market Trends
            </h2>
            <div
              class="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100/50 backdrop-blur-sm"
            >
              <table class="w-full border-collapse text-left">
                <thead>
                  <tr class="border-b border-white/5 bg-white/5">
                    <th
                      class="px-6 py-4 text-xs font-bold tracking-widest text-slate-400 uppercase"
                    >
                      Pair
                    </th>
                    <th
                      class="px-6 py-4 text-xs font-bold tracking-widest text-slate-400 uppercase"
                    >
                      Last Price
                    </th>
                    <th
                      class="px-6 py-4 text-xs font-bold tracking-widest text-slate-400 uppercase"
                    >
                      Trend
                    </th>
                    <th
                      class="px-6 py-4 text-right text-xs font-bold tracking-widest text-slate-400 uppercase"
                    >
                      Change (24h)
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-white/5">
                  {#each marketTrends as trend}
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
          </section>
        </div>

        <!-- Right Column: Exchange Calculator -->
        <div class="col-span-12 lg:col-span-5">
          <div class="sticky top-8">
            <h2 class="mb-5 flex items-center gap-2 text-xl font-bold">
              <Calculator class="size-5 text-indigo-500" />
              Exchange Calculator
            </h2>
            <div class="bg-[#6366f10d] backdrop-blur-sm border border-white/10 rounded-3xl p-8 shadow-2xl shadow-indigo-500/5">
              <div class="space-y-6">
                <!-- From Section -->
                <div class="space-y-2">
                  <label for="from-currency" class="px-1 text-sm font-bold text-slate-400">
                    From
                  </label>
                  <div class="flex gap-2">
                    <div
                      class="flex flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3"
                    >
                      <div
                        class="size-8 rounded-full bg-cover bg-center"
                        style="background-image: url('{currencies[0].flagUrl}')"
                      ></div>
                      <select
                        id="from-currency"
                        bind:value={selectedFrom}
                        class="w-full cursor-pointer border-none bg-transparent font-bold focus:ring-0"
                      >
                        {#each currencies as currency}
                          <option value="{currency.code} - {currency.name}" class="bg-slate-900">
                            {currency.code} - {currency.name}
                          </option>
                        {/each}
                      </select>
                    </div>
                    <div class="w-32 rounded-2xl border border-white/10 bg-white/5 p-3">
                      <input
                        type="text"
                        bind:value={fromAmount}
                        class="w-full border-none bg-transparent p-0 text-right font-bold focus:ring-0"
                      />
                    </div>
                  </div>
                </div>

                <!-- Swap Button -->
                <div class="relative z-20 -my-3 flex justify-center">
                  <button
                    class="flex size-12 items-center justify-center rounded-full bg-indigo-600 text-white shadow-xl shadow-indigo-600/40 transition-transform hover:scale-110"
                  >
                    <ArrowDownUp class="size-5" />
                  </button>
                </div>

                <!-- To Section -->
                <div class="space-y-2">
                  <label for="to-currency" class="px-1 text-sm font-bold text-slate-400">
                    To
                  </label>
                  <div class="flex gap-2">
                    <div
                      class="flex flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3"
                    >
                      <div
                        class="size-8 rounded-full bg-cover bg-center"
                        style="background-image: url('{currencies[1].flagUrl}')"
                      ></div>
                      <select
                        id="to-currency"
                        bind:value={selectedTo}
                        class="w-full cursor-pointer border-none bg-transparent font-bold focus:ring-0"
                      >
                        {#each currencies as currency}
                          <option value="{currency.code} - {currency.name}" class="bg-slate-900">
                            {currency.code} - {currency.name}
                          </option>
                        {/each}
                      </select>
                    </div>
                    <div class="w-32 rounded-2xl border border-white/10 bg-white/5 p-3">
                      <input
                        type="text"
                        bind:value={toAmount}
                        readonly
                        class="w-full border-none bg-transparent p-0 text-right font-bold text-indigo-400 focus:ring-0"
                      />
                    </div>
                  </div>
                </div>

                <!-- Conversion Info -->
                <div class="space-y-3 rounded-2xl bg-white/5 p-5">
                  <div class="flex justify-between text-sm">
                    <span class="text-slate-400">Exchange Rate</span>
                    <span class="font-medium">1 USD = 0.9234 EUR</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-slate-400">Processing Fee (0.5%)</span>
                    <span class="font-medium">$5.00</span>
                  </div>
                  <div class="flex items-center justify-between border-t border-white/10 pt-3">
                    <span class="font-bold text-slate-200">Estimated Total</span>
                    <span class="text-2xl font-black">918.78 EUR</span>
                  </div>
                </div>

                <button
                  class="w-full rounded-2xl bg-indigo-600 py-4 text-lg font-bold text-white shadow-xl shadow-indigo-600/20 transition-all hover:bg-indigo-500 active:scale-[0.98]"
                >
                  Exchange Now
                </button>

                <p class="text-center text-xs text-slate-500">
                  Last updated 2 minutes ago. Rates are indicative.
                </p>
              </div>
            </div>

            <!-- Monthly Limit Indicator -->
            <div
              class="mt-6 flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-100/50 p-4 backdrop-blur-sm"
            >
              <div class="flex size-10 items-center justify-center rounded-full bg-indigo-500/10">
                <Info class="size-5 text-indigo-500" />
              </div>
              <div class="flex-1">
                <div class="mb-1 flex justify-between">
                  <span class="text-xs font-bold uppercase">Monthly Limit</span>
                  <span class="text-xs text-slate-400">85% Used</span>
                </div>
                <div class="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    class="h-full w-[85%] rounded-full bg-indigo-500"
                    style="box-shadow: 0 0 8px rgba(99, 102, 241, 0.5)"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</div>

<style>
  .active-glass {
    background: rgba(99, 102, 241, 0.12);
    border: 1px solid rgba(99, 102, 241, 0.35);
  }
</style>
