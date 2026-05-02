<script lang="ts">
  import { ArrowDownUp, Calculator } from '@lucide/svelte';
  import type { Currency, ExchangeRate } from '$lib/types/currency.js';

  let {
    currencies,
    exchangeRate
  }: {
    currencies: Currency[];
    exchangeRate: ExchangeRate;
  } = $props();

  let fromAmount = $state('1,000.00');
  let toAmount = $state('923.40');
  let selectedFrom = $state('USD - US Dollar');
  let selectedTo = $state('EUR - Euro');
</script>

<div class="sticky top-8">
  <h2 class="mb-5 flex items-center gap-2 text-xl font-bold">
    <Calculator class="size-5 text-indigo-500" />
    Exchange Calculator
  </h2>
  <div
    class="rounded-3xl border border-white/10 bg-[#6366f10d] p-8 shadow-2xl shadow-indigo-500/5 backdrop-blur-sm"
  >
    <div class="space-y-6">
      <!-- From Section -->
      <div class="space-y-2">
        <label for="from-currency" class="px-1 text-sm font-bold text-slate-400"> From </label>
        <div class="flex gap-2">
          <div
            class="flex flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3"
          >
            <div
              class="size-8 rounded-full bg-cover bg-center"
              style="background-image: url('{currencies[0]?.flagUrl}')"
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
        <label for="to-currency" class="px-1 text-sm font-bold text-slate-400"> To </label>
        <div class="flex gap-2">
          <div
            class="flex flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3"
          >
            <div
              class="size-8 rounded-full bg-cover bg-center"
              style="background-image: url('{currencies[1]?.flagUrl}')"
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
          <span class="font-medium"
            >1 {exchangeRate.from} = {exchangeRate.rate} {exchangeRate.to}</span
          >
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-slate-400">Processing Fee ({exchangeRate.feePercent}%)</span>
          <span class="font-medium">{exchangeRate.feeAmount}</span>
        </div>
        <div class="flex items-center justify-between border-t border-white/10 pt-3">
          <span class="font-bold text-slate-200">Estimated Total</span>
          <span class="text-2xl font-black">{exchangeRate.estimatedTotal}</span>
        </div>
      </div>

      <button
        class="w-full rounded-2xl bg-indigo-600 py-4 text-lg font-bold text-white shadow-xl shadow-indigo-600/20 transition-all hover:bg-indigo-500 active:scale-[0.98]"
      >
        Exchange Now
      </button>

      <p class="text-center text-xs text-slate-500">
        Last updated {exchangeRate.lastUpdated}. Rates are indicative.
      </p>
    </div>
  </div>
</div>
