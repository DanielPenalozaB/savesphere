<script lang="ts">
  import { page } from '$app/state';
</script>

<div class="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
  <h1 class="text-4xl font-bold tracking-tighter text-slate-900 dark:text-white">
    {page.status}
  </h1>
  <p class="text-lg text-slate-500 dark:text-slate-400">
    {page.error?.message || 'Something went wrong'}
  </p>
  <a
    href="/"
    class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
  >
    Go Home
  </a>
</div>
