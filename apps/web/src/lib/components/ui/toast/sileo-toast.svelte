<script lang="ts">
  import { toastStore, type ToastItem } from './store.svelte.js';
  import Check from '@lucide/svelte/icons/check';
  import X from '@lucide/svelte/icons/x';
  import LoaderCircle from '@lucide/svelte/icons/loader-circle';
  import Info from '@lucide/svelte/icons/info';
  import TriangleAlert from '@lucide/svelte/icons/triangle-alert';

  let { toast }: { toast: ToastItem } = $props();

  const iconMap = {
    success: Check,
    error: X,
    warning: TriangleAlert,
    info: Info,
    loading: LoaderCircle,
    action: Info
  };

  const Icon = $derived(iconMap[toast.type]);

  const isBottom = $derived(toast.position?.startsWith('bottom'));

  const visibleClasses = $derived(
    toast.visible
      ? 'opacity-100 scale-100 translate-y-0'
      : `opacity-0 scale-95 pointer-events-none ${isBottom ? 'translate-y-1.5' : '-translate-y-1.5'}`
  );

  const textColorMap: Record<string, string> = {
    success: 'text-[var(--sileo-success)]',
    error: 'text-[var(--sileo-error)]',
    warning: 'text-[var(--sileo-warning)]',
    info: 'text-[var(--sileo-info)]',
    loading: 'text-foreground',
    action: 'text-primary'
  };

  const textColor = $derived(textColorMap[toast.type]);

  const btnClassesMap: Record<string, string> = {
    success:
      'bg-[color-mix(in_oklch,var(--sileo-success)_15%,transparent)] text-[var(--sileo-success)] hover:bg-[color-mix(in_oklch,var(--sileo-success)_25%,transparent)]',
    error:
      'bg-[color-mix(in_oklch,var(--sileo-error)_15%,transparent)] text-[var(--sileo-error)] hover:bg-[color-mix(in_oklch,var(--sileo-error)_25%,transparent)]',
    warning:
      'bg-[color-mix(in_oklch,var(--sileo-warning)_15%,transparent)] text-[var(--sileo-warning)] hover:bg-[color-mix(in_oklch,var(--sileo-warning)_25%,transparent)]',
    info: 'bg-[color-mix(in_oklch,var(--sileo-info)_15%,transparent)] text-[var(--sileo-info)] hover:bg-[color-mix(in_oklch,var(--sileo-info)_25%,transparent)]',
    loading: 'bg-[color-mix(in_oklch,var(--foreground)_15%,transparent)] text-foreground',
    action:
      'bg-[color-mix(in_oklch,var(--primary)_15%,transparent)] text-primary hover:bg-[color-mix(in_oklch,var(--primary)_25%,transparent)]'
  };

  const btnClasses = $derived(btnClassesMap[toast.type]);
</script>

<div
  class="pointer-events-auto flex w-fit flex-col items-end overflow-visible bg-transparent text-[0.825rem] font-medium transition-[transform,opacity] duration-400 ease-(--sileo-spring-easing) {visibleClasses} {textColor}"
  role="alert"
  aria-live="polite"
  onmouseenter={() => {
    toastStore.pause(toast.id);
    if (toast.expandOnHover) toast.expanded = true;
  }}
  onmouseleave={() => {
    toastStore.resume(toast.id);
    if (toast.expandOnHover) toast.expanded = false;
  }}
>
  <!-- Title wrap -->
  <div
    class="flex max-h-10 min-h-10 w-fit items-center gap-2 bg-card p-2 pr-3.5 text-sm shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all duration-400 ease-(--sileo-spring-easing)"
    style:border-radius={toast.expanded ? '24px 24px 0 0' : '24px'}
  >
    <div
      class="flex items-center gap-2 transition-all duration-400 ease-(--sileo-spring-easing)"
      style:border-radius={toast.expanded ? '24px 24px 0 0' : '24px'}
      style:scale={toast.expanded ? 0.9 : 1}
    >
      <span class="flex size-6 shrink-0 items-center justify-center rounded-full {btnClasses}">
        <Icon class="size-4 {toast.type === 'loading' ? 'animate-spin' : ''}" aria-hidden="true" />
      </span>
      <span class="text-right font-normal whitespace-nowrap">{toast.title}</span>
    </div>
  </div>

  {#if toast.description || toast.button}
    <!-- Description wrap -->
    <div
      class="w-fit max-w-[350px] overflow-hidden rounded-tl-2xl rounded-b-2xl bg-card shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
      style:max-height={toast.expanded ? '300px' : '0'}
      style:opacity={toast.expanded ? '1' : '0'}
      style:padding={toast.expanded ? '0.5rem 0.75rem' : '0 0.75rem'}
      style:transition={`max-height 400ms var(--sileo-spring-easing), opacity 300ms ease, padding
      400ms var(--sileo-spring-easing)`}
    >
      {#if toast.description}
        <p
          class="wrap-break-words m-0 w-fit max-w-[320px] text-[0.875rem] leading-5 font-normal whitespace-normal text-muted-foreground"
        >
          {toast.description}
        </p>
      {/if}
      {#if toast.button}
        <button
          type="button"
          class="mt-2 cursor-pointer rounded-full border-none p-1.5 text-xs font-medium transition-colors duration-200 {btnClasses}"
          onclick={toast.button.onClick}
        >
          {toast.button.title}
        </button>
      {/if}
    </div>
  {/if}
</div>
