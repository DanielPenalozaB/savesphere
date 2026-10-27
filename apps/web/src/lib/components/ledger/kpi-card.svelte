<script lang="ts">
	import type { Component, Snippet } from 'svelte';
	import type { SVGAttributes } from 'svelte/elements';

	interface Props {
		label: string;
		value: string;
		icon: Component<SVGAttributes<SVGSVGElement>>;
		/** "dark" is the design's highlighted card (inverse surface). */
		variant?: 'light' | 'dark';
		tone?: 'neutral' | 'income' | 'expense';
		children?: Snippet;
	}

	let { label, value, icon: Icon, variant = 'light', tone = 'neutral', children }: Props = $props();
</script>

<article
	class={[
		'flex flex-col justify-between gap-3 rounded-[1.5rem] p-4 md:gap-4 md:rounded-card md:p-6',
		variant === 'dark'
			? 'bg-inverse-surface text-inverse-on-surface shadow-xl'
			: 'bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)]'
	]}
>
	<header class="flex items-start justify-between gap-2">
		<h3
			class={[
				'font-sans text-label-sm tracking-wider uppercase md:text-label-md',
				variant === 'dark' ? 'text-primary-fixed-dim' : 'text-on-surface-variant'
			]}
		>
			{label}
		</h3>
		<span
			class={[
				'flex size-8 shrink-0 items-center justify-center rounded-full md:size-9',
				variant === 'dark' ? 'bg-white/10 text-primary-container' : 'bg-surface-container-low',
				variant === 'light' && tone === 'income' && 'text-tertiary',
				variant === 'light' && tone === 'expense' && 'text-primary',
				variant === 'light' && tone === 'neutral' && 'text-primary'
			]}
		>
			<Icon class="size-5" aria-hidden="true" />
		</span>
	</header>
	<div>
		<!-- Sized so a full COP amount fits a half-width phone card without breaking mid-number. -->
		<p
			class="font-display text-headline-md whitespace-nowrap tabular-nums sm:text-headline-lg xl:text-[2rem] xl:leading-10"
		>
			{value}
		</p>
		{#if children}
			<div
				class={[
					'mt-1 text-body-sm',
					variant === 'dark' ? 'text-inverse-on-surface/70' : 'text-on-surface-variant'
				]}
			>
				{@render children()}
			</div>
		{/if}
	</div>
</article>
