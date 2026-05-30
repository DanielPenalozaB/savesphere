<script lang="ts">
  import { toastStore, type ToastItem } from './store.svelte.js';
  import Check from '@lucide/svelte/icons/check';
  import X from '@lucide/svelte/icons/x';
  import LoaderCircle from '@lucide/svelte/icons/loader-circle';
  import MessageCircleWarning from '@lucide/svelte/icons/message-circle-warning';
  import CircleAlert from '@lucide/svelte/icons/circle-alert';

  let { toast }: { toast: ToastItem } = $props();

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

  const swapFilter = $derived(
    toast.swapping
      ? 'drop-shadow(0 0 0.5px rgba(0,0,0,0.12)) drop-shadow(0 2px 8px rgba(0,0,0,0.06)) blur(4px)'
      : 'drop-shadow(0 0 0.5px rgba(0,0,0,0.12)) drop-shadow(0 2px 8px rgba(0,0,0,0.06)) blur(0px)'
  );
</script>

<div
  class="pointer-events-auto flex w-fit flex-col items-end overflow-visible bg-transparent text-[0.825rem] font-medium {visibleClasses} {textColor}"
  style:filter={swapFilter}
  style:transition={`transform 400ms var(--sonner-spring-easing), opacity 400ms
  var(--sonner-spring-easing), filter 250ms ease`}
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
    class="relative flex max-h-10 min-h-10 w-fit items-center gap-2 bg-card p-2 pr-3.5 text-sm transition-all duration-400 ease-(--sonner-spring-easing)"
    style:border-radius={toast.expanded ? '24px 24px 0 0' : '24px'}
  >
    <div
      class="flex items-center gap-2 transition-all duration-400 ease-(--sonner-spring-easing)"
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
        class="absolute bottom-4 -left-4 translate-y-full text-card transition-opacity duration-300"
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
      class="w-fit max-w-[350px] origin-top overflow-hidden rounded-tl-2xl rounded-tr-none rounded-br-2xl rounded-bl-2xl bg-card"
      style:max-height={toast.expanded ? '300px' : '0'}
      style:opacity={toast.expanded ? '1' : '0'}
      style:transform={toast.expanded ? 'scaleY(1) translateY(0)' : 'scaleY(0.6) translateY(-4px)'}
      style:padding={toast.expanded ? '0.5rem 0.75rem' : '0 0.75rem'}
      style:transition="max-height 400ms var(--sonner-spring-easing), opacity 200ms ease, padding 400ms var(--sonner-spring-easing), transform 400ms var(--sonner-spring-easing)"
    >
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
  {/if}
</div>
