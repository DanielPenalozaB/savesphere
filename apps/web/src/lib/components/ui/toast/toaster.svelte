<script lang="ts">
  import { toastStore } from './store.svelte.js';
  import SileoToast from './sileo-toast.svelte';
  import type { ToastPosition } from './store.svelte.js';

  const positions: ToastPosition[] = [
    'top-left',
    'top-center',
    'top-right',
    'bottom-left',
    'bottom-center',
    'bottom-right'
  ];

  function positionClasses(pos: ToastPosition): string {
    const base = 'fixed z-[9999] flex gap-2 pointer-events-none p-4';
    switch (pos) {
      case 'top-left':
        return `${base} top-0 left-0 flex-col-reverse items-start`;
      case 'top-center':
        return `${base} top-0 left-1/2 -translate-x-1/2 flex-col-reverse items-center`;
      case 'top-right':
        return `${base} top-0 right-0 flex-col-reverse items-end`;
      case 'bottom-left':
        return `${base} bottom-0 left-0 flex-col items-start`;
      case 'bottom-center':
        return `${base} bottom-0 left-1/2 -translate-x-1/2 flex-col items-center`;
      case 'bottom-right':
        return `${base} bottom-0 right-0 flex-col items-end`;
    }
  }
</script>

{#each positions as pos}
  <div class={positionClasses(pos)}>
    {#each toastStore.toasts.filter((t) => t.position === pos) as toast (toast.id)}
      <SileoToast {toast} />
    {/each}
  </div>
{/each}
