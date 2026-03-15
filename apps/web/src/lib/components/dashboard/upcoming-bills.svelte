<script lang="ts">
  import { cn } from '$lib/utils';
  import { CalendarClock, CalendarSync, ChevronRight, House } from '@lucide/svelte';

  const bills = [
    {
      name: 'Rent Payment',
      amount: 1250000,
      category: 'Housing',
      frequency: 'Monthly',
      dueDate: '2026-03-12',
      payDate: '2026-03-12',
      paymentMethod: 'Manual'
    },
    {
      name: 'Rent Payment',
      amount: 1250000,
      category: 'Housing',
      frequency: 'Monthly',
      dueDate: '2026-03-12',
      payDate: '2026-03-12',
      paymentMethod: 'Auto'
    },
    {
      name: 'Rent Payment',
      amount: 1250000,
      category: 'Housing',
      frequency: 'Monthly',
      dueDate: '2026-03-12',
      payDate: '2026-03-12',
      paymentMethod: 'Manual'
    },
    {
      name: 'Rent Payment',
      amount: 1250000,
      category: 'Housing',
      frequency: 'Monthly',
      dueDate: '2026-03-12',
      payDate: '2026-03-12',
      paymentMethod: 'Auto'
    }
  ];

  const tabs = [
    { label: 'Due this week', value: 'dueThisWeek' },
    { label: 'Next month', value: 'nextMonth' },
    { label: 'Subscriptions', value: 'subscriptions' }
  ];

  let selectedTab = $state(tabs[0]);
</script>

<div
  class="flex flex-col gap-6 rounded-lg border border-white/5 bg-slate-100 p-4 dark:bg-slate-900"
>
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-2">
      <CalendarClock class="size-5" />
      <h3 class="text-lg font-bold tracking-tight text-slate-600 dark:text-white">
        Upcoming Bills
      </h3>
    </div>
    <div
      class="flex items-center rounded-md border border-slate-300 p-1 text-xs leading-tight font-medium *:tracking-normal *:uppercase dark:border-slate-700"
    >
      {#each tabs as tab}
        <button
          class={cn(
            'cursor-pointer rounded-[4px] px-2 py-1 transition ease-out',
            selectedTab.value === tab.value
              ? 'bg-indigo-500 text-white dark:bg-indigo-400'
              : 'text-slate-400 hover:bg-indigo-100 dark:text-slate-500'
          )}
          onclick={() => (selectedTab = tab)}
        >
          {tab.label}
        </button>
      {/each}
    </div>
  </div>
  <div class="flex h-full flex-col gap-2">
    {#each bills as bill}
      <div class="flex items-center gap-4 rounded-md">
        <div class="flex min-w-0 flex-1 items-center gap-2">
          <div class="flex items-center gap-5 overflow-hidden">
            <div
              class="flex size-10 items-center justify-center rounded-lg bg-slate-200 text-slate-400 dark:bg-slate-700"
            >
              <House class="size-6" />
            </div>
            <div class="min-w-0 flex-1">
              <div
                class="flex items-center gap-2 text-base font-semibold tracking-normal text-slate-600 dark:text-slate-100"
              >
                <span class="min-w-0 truncate">{bill.name}</span>
                <span class="shrink-0 text-slate-600">•</span>
                <span class="shrink-0 text-slate-500 dark:text-slate-400">${bill.amount}</span>
              </div>
              <div class="mt-1 flex w-fit items-center gap-2 text-xs font-medium text-slate-400">
                <div class="flex items-center gap-1">
                  <House class="size-3" />
                  <span>{bill.category}</span>
                </div>
                <ChevronRight class="size-4 shrink-0" />
                <div class="flex items-center gap-1">
                  <CalendarSync class="size-3" />
                  <span>{bill.frequency}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="flex flex-col items-end gap-1">
          <span
            class={cn(
              'rounded-full border px-2 py-1 text-xs leading-tight font-medium whitespace-nowrap',
              {
                'border-indigo-300 bg-indigo-200 text-indigo-600 dark:bg-indigo-900 dark:text-white':
                  bill.paymentMethod === 'Manual',
                'border-emerald-300 bg-emerald-200 text-emerald-600 dark:bg-emerald-900 dark:text-white':
                  bill.paymentMethod === 'Auto'
              }
            )}
          >
            {bill.paymentMethod === 'Manual' ? 'Pay' : 'Auto'}
          </span>
          <span class="text-xs text-slate-400 dark:text-slate-500">{bill.dueDate}</span>
        </div>
      </div>
      <hr class="last:hidden" />
    {/each}
  </div>
  <a
    href="/transactions/bills"
    class="mx-auto text-sm text-slate-500 transition-colors hover:text-slate-400 dark:hover:text-white"
  >
    Show all upcoming bills
  </a>
</div>
