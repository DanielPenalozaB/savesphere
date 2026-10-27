<script lang="ts">
	import './layout.css';
	import NavigationProgress from '#lib/components/navigation-progress.svelte';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<NavigationProgress />
{@render children()}
