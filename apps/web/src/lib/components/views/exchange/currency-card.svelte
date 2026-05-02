<script lang="ts">
  import { Check } from '@lucide/svelte';
  import type { Currency } from '$lib/types/currency.js';

  let { currency }: { currency: Currency } = $props();
</script>

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
        <p class="text-xs font-semibold tracking-wider text-indigo-400">PRIMARY ACCOUNT</p>
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
        class="rounded-lg bg-white/5 px-3 py-1.5 text-xs whitespace-nowrap text-slate-300 transition-all hover:bg-white/10"
      >
        SET AS DEFAULT
      </button>
    {/if}
  </div>
</div>

<style>
  .active-glass {
    background: rgba(99, 102, 241, 0.12);
    border: 1px solid rgba(99, 102, 241, 0.35);
  }
</style>
