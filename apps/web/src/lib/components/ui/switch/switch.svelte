<script lang="ts">
  import { Switch as SwitchPrimitive } from 'bits-ui';
  import { cn, type WithoutChildrenOrChild } from '$lib/utils.js';

  let {
    ref = $bindable(null),
    class: className,
    checked = $bindable(false),
    ...restProps
  }: WithoutChildrenOrChild<SwitchPrimitive.RootProps> = $props();
</script>

<SwitchPrimitive.Root
  bind:ref
  bind:checked
  data-slot="switch"
  class={cn(
    'peer inline-flex h-[1.15rem] w-9 shrink-0 items-center rounded-[4px] border border-transparent transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-neutral-900 data-[state=unchecked]:bg-neutral-200 dark:data-[state=unchecked]:bg-neutral-800',
    className
  )}
  {...restProps}
>
  <SwitchPrimitive.Thumb
    data-slot="switch-thumb"
    class={cn(
      'pointer-events-none block size-[13px] rounded-[2px] bg-background ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%+6px)] data-[state=unchecked]:translate-x-0.5 dark:data-[state=checked]:bg-neutral-900 dark:data-[state=unchecked]:bg-neutral-200'
    )}
  />
</SwitchPrimitive.Root>
