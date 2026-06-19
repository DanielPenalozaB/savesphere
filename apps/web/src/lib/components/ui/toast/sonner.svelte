<script lang="ts">
  import { toastStore, type ToastItem } from './store.svelte.js';
  import Check from '@lucide/svelte/icons/check';
  import X from '@lucide/svelte/icons/x';
  import LoaderCircle from '@lucide/svelte/icons/loader-circle';
  import MessageCircleWarning from '@lucide/svelte/icons/message-circle-warning';
  import CircleAlert from '@lucide/svelte/icons/circle-alert';

  let { toast }: { toast: ToastItem } = $props();

  let dragging = $state(false);
  let dragY = $state(0);
  let startY = 0;
  const DISMISS_THRESHOLD = 60;

  const iconMap = {
    success: Check,
    error: X,
    warning: CircleAlert,
    info: MessageCircleWarning,
    loading: LoaderCircle,
    action: MessageCircleWarning
  };

  const Icon = $derived(iconMap[toast.type]);

  const isBottom = $derived(toast.position?.startsWith('bottom'));

  const visibleClasses = $derived(
    toast.visible
      ? 'opacity-100 scale-100 translate-y-0'
      : `opacity-0 scale-95 pointer-events-none ${isBottom ? 'translate-y-1.5' : '-translate-y-1.5'}`
  );

  const textColorMap: Record<string, string> = {
    success: 'text-[var(--sonner-success)]',
    error: 'text-[var(--sonner-error)]',
    warning: 'text-[var(--sonner-warning)]',
    info: 'text-[var(--sonner-info)]',
    loading: 'text-foreground',
    action: 'text-primary'
  };

  const textColor = $derived(textColorMap[toast.type]);

  const btnClassesMap: Record<string, string> = {
    success:
      'bg-[color-mix(in_oklch,var(--sonner-success)_15%,transparent)] text-[var(--sonner-success)] hover:bg-[color-mix(in_oklch,var(--sonner-success)_25%,transparent)]',
    error:
      'bg-[color-mix(in_oklch,var(--sonner-error)_15%,transparent)] text-[var(--sonner-error)] hover:bg-[color-mix(in_oklch,var(--sonner-error)_25%,transparent)]',
    warning:
      'bg-[color-mix(in_oklch,var(--sonner-warning)_15%,transparent)] text-[var(--sonner-warning)] hover:bg-[color-mix(in_oklch,var(--sonner-warning)_25%,transparent)]',
    info: 'bg-[color-mix(in_oklch,var(--sonner-info)_15%,transparent)] text-[var(--sonner-info)] hover:bg-[color-mix(in_oklch,var(--sonner-info)_25%,transparent)]',
    loading: 'bg-[color-mix(in_oklch,var(--foreground)_15%,transparent)] text-foreground',
    action:
      'bg-[color-mix(in_oklch,var(--primary)_15%,transparent)] text-primary hover:bg-[color-mix(in_oklch,var(--primary)_25%,transparent)]'
  };

  const btnClasses = $derived(btnClassesMap[toast.type]);

  const baseDropShadow =
    'drop-shadow(0 0 0.5px rgba(0,0,0,0.12)) drop-shadow(0 2px 8px rgba(0,0,0,0.06))';

  const dragBlur = $derived(Math.min(Math.abs(dragY) / 15, 5));

  let expanding = $state(false);
  let prevExpanded = $state(false);

  $effect(() => {
    if (toast.expanded && !prevExpanded) {
      expanding = true;
      setTimeout(() => {
        expanding = false;
      }, 140);
    }
    prevExpanded = !!toast.expanded;
  });

  const swapFilter = $derived.by(() => {
    if (toast.swapping) return `${baseDropShadow} blur(4px)`;
    if (expanding) return `${baseDropShadow} blur(1.5px)`;
    if (dragging && dragY !== 0) return `${baseDropShadow} blur(${dragBlur}px)`;
    return `${baseDropShadow} blur(0px)`;
  });

  const dragOpacity = $derived(Math.max(0, 1 - Math.abs(dragY) / (DISMISS_THRESHOLD * 1.5)));

  function onPointerDown(e: PointerEvent) {
    dragging = true;
    dragY = 0;
    startY = e.clientY;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: PointerEvent) {
    if (!dragging) return;
    dragY = e.clientY - startY;
  }

  function onPointerUp() {
    if (!dragging) return;
    dragging = false;
    if (Math.abs(dragY) >= DISMISS_THRESHOLD) {
      toastStore.dismiss(toast.id);
    } else {
      dragY = 0;
    }
  }

  let titleInnerEl = $state<HTMLElement | null>(null);
  let titleWidth = $state<number | null>(null);
  let descEl = $state<HTMLElement | null>(null);
  let descWidth = $state<number | null>(null);

  $effect(() => {
    if (!titleInnerEl) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        titleWidth = entry.contentBoxSize[0].inlineSize;
      }
    });
    ro.observe(titleInnerEl);
    return () => ro.disconnect();
  });

  $effect(() => {
    if (!descEl) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        descWidth = entry.contentBoxSize[0].inlineSize;
      }
    });
    ro.observe(descEl);
    return () => ro.disconnect();
  });
</script>

<div
  class="pointer-events-auto flex w-fit cursor-grab flex-col items-end overflow-visible bg-transparent text-[0.825rem] font-medium {visibleClasses} {textColor}"
  class:cursor-grabbing={dragging}
  style:filter={swapFilter}
  style:transform="translateY({dragY}px)"
  style:opacity={dragging ? dragOpacity : undefined}
  style:transition={dragging ? 'filter 250ms ease' : 'transform 400ms var(--sonner-spring-easing), opacity 400ms var(--sonner-spring-easing), filter 250ms ease'}
  role="alert"
  aria-live="polite"
  onpointerdown={onPointerDown}
  onpointermove={onPointerMove}
  onpointerup={onPointerUp}
  onpointercancel={onPointerUp}
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
    class="relative flex max-h-10 min-h-10 items-center gap-2 overflow-visible bg-card p-2 pr-3.5 text-sm transition-all duration-200 ease-(--sonner-spring-easing)"
    style:border-radius={toast.expanded ? '24px 24px 0 0' : '24px'}
    style:width={titleWidth !== null ? `${titleWidth + 24 + 14}px` : 'fit-content'}
  >
    <div
      bind:this={titleInnerEl}
      class="flex w-fit items-center gap-2 transition-[transform] duration-200 ease-(--sonner-spring-easing)"
      style:border-radius={toast.expanded ? '24px 24px 0 0' : '24px'}
      style:scale={toast.expanded ? 0.9 : 1}
    >
      <span class="flex size-6 shrink-0 items-center justify-center rounded-full {btnClasses}">
        <Icon class="size-4 {toast.type === 'loading' ? 'animate-spin' : ''}" aria-hidden="true" />
      </span>
      <span class="text-right font-normal whitespace-nowrap">{toast.title}</span>
    </div>

    {#if toast.description || toast.button}
      <!-- Concave curve connector -->
      <svg
        class="absolute bottom-4 -left-4 translate-y-full text-card transition-opacity duration-200"
        style:opacity={toast.expanded ? '1' : '0'}
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M16 0 C16 8.837 8.837 16 0 16 L16 16 Z" />
      </svg>
    {/if}
  </div>

  {#if toast.description || toast.button}
    <!-- Description wrap -->
    <div
      class="max-w-[350px] origin-top overflow-hidden rounded-tl-2xl rounded-tr-none rounded-b-2xl bg-card"
      style:max-height={toast.expanded ? '300px' : '0'}
      style:opacity={toast.expanded ? '1' : '0'}
      style:transform={toast.expanded ? 'scaleY(1) translateY(0)' : 'scaleY(0.6) translateY(-4px)'}
      style:padding={toast.expanded ? '0.75rem 1rem' : '0 1rem'}
      style:min-width={descWidth !== null ? `${descWidth + 32}px` : undefined}
      style:transition="max-height 400ms var(--sonner-spring-easing), opacity 200ms ease, padding 400ms var(--sonner-spring-easing), transform 400ms var(--sonner-spring-easing), min-width 300ms var(--sonner-spring-easing)"
    >
      <div bind:this={descEl} class="w-fit">
        {#if toast.description}
          <p
            class="wrap-break-words m-0 w-fit max-w-[320px] text-[0.875rem] leading-5 font-normal whitespace-normal text-slate-400"
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
    </div>
  {/if}
</div>
