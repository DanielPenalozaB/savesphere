<script lang="ts">
  let { percentage = 75 } = $props();
</script>

<div class="flex flex-col gap-4">
  <div class="h-6 w-full overflow-hidden rounded-full bg-indigo-200 dark:bg-indigo-900">
    <div
      class="h-full rounded-full bg-indigo-500 transition-all duration-500"
      style="width: {percentage}%"
    ></div>
  </div>
  <div class="flex items-center justify-between text-sm font-semibold">
    <span class="text-indigo-500 dark:text-indigo-300">{percentage}% consumed </span>
    <span class="text-white dark:text-slate-400">12 days left</span>
  </div>
</div>
