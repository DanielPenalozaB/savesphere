<script lang="ts">
	import { navigating } from '$app/state';
</script>

<!-- Thin bar while a navigation loads (shown only after a short delay, so fast pages don't flash). -->
{#if navigating.to}
	<div
		class="navigation-progress fixed inset-x-0 top-0 z-[60] h-0.5 overflow-hidden"
		role="progressbar"
		aria-label="Loading"
	>
		<div class="h-full w-1/3 rounded-full bg-primary-container"></div>
	</div>
{/if}
