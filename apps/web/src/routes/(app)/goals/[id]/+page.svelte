<script lang="ts">
	import IconBack from '~icons/material-symbols/arrow-back';
	import type { GoalStatus } from '@savesphere/contracts';
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import FormError from '#lib/components/form/form-error.svelte';
	import Spinner from '#lib/components/spinner.svelte';
	import { goalProgress } from '#lib/goals.ts';
	import { formatMoney } from '#lib/money.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { toast } from '#lib/toast.svelte.ts';
	import type { SubmitFunction } from './$types';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	let busy = $state<string | null>(null);

	const goal = $derived(data.goal);
	const progress = $derived(goalProgress(goal, data.today));
	const money = (minor: number) => formatMoney(minor, goal.currency, data.locale);
	const percent = $derived(
		new Intl.NumberFormat(data.locale, { style: 'percent', maximumFractionDigits: 1 }).format(
			progress.permille / 1000
		)
	);
	const statusLabels: Record<GoalStatus, () => string> = {
		active: m.goals_status_active,
		paused: m.goals_status_paused,
		achieved: m.goals_status_achieved,
		abandoned: m.goals_status_abandoned
	};
	/** The status changes offered from each status. */
	const transitions: Record<GoalStatus, { to: GoalStatus; label: () => string }[]> = {
		active: [
			{ to: 'achieved', label: m.goal_detail_achieve },
			{ to: 'paused', label: m.goal_detail_pause },
			{ to: 'abandoned', label: m.goal_detail_abandon }
		],
		paused: [
			{ to: 'active', label: m.goal_detail_resume },
			{ to: 'abandoned', label: m.goal_detail_abandon }
		],
		achieved: [{ to: 'active', label: m.goal_detail_reopen }],
		abandoned: [{ to: 'active', label: m.goal_detail_reopen }]
	};

	const moneyErrors = {
		amount: m.tx_error_amount,
		withdraw: m.goal_error_withdraw,
		abandoned: m.goal_error_abandoned,
		generic: m.goal_error_update
	};
	const updateErrors = {
		name: m.goal_error_name,
		amount: m.tx_error_amount,
		date: m.goal_error_date,
		generic: m.goal_error_update
	};
	const moneyError = $derived(
		form?.action === 'money' && 'error' in form && form.error ? moneyErrors[form.error]() : null
	);
	const updateError = $derived(
		form?.action === 'update' && 'error' in form && form.error ? updateErrors[form.error]() : null
	);

	const submit =
		(name: string, success: () => string, reset = false): SubmitFunction =>
		() => {
			busy = name;
			return async ({ result, update }) => {
				if (result.type === 'success') toast(success());
				await update({ reset: reset && result.type === 'success' });
				busy = null;
			};
		};

	const inputClass =
		'w-full rounded-2xl border-0 bg-surface-container-low px-4 py-3 text-body-lg text-on-surface focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary-container';
	const primaryButton =
		'inline-flex items-center justify-center gap-2 rounded-full bg-primary-container px-6 py-3 text-title-sm text-on-primary shadow-lg shadow-primary-container/25 transition hover:brightness-105 disabled:opacity-60';
	const targetInput = $derived(
		formatMoney(goal.targetMinor, goal.currency, data.locale, { plain: true })
	);
</script>

<svelte:head>
	<title>{goal.name} · {m.app_name()}</title>
</svelte:head>

<a
	href={resolve('goals')}
	class="mb-4 inline-flex items-center gap-1 text-label-lg text-on-surface-variant transition hover:text-primary"
>
	<IconBack class="size-5" aria-hidden="true" />{m.goal_detail_back()}
</a>

<header class="mb-6 card">
	<div class="flex flex-wrap items-center gap-3">
		<h1 class="text-headline-lg md:text-headline-xl">{goal.name}</h1>
		<span
			class="rounded-full bg-surface-container-high px-2.5 py-1 text-label-sm text-on-surface-variant"
			>{statusLabels[goal.status]()}</span
		>
	</div>
	<p class="mt-4 flex flex-wrap items-baseline justify-between gap-x-3">
		<span>
			<span class="font-display text-headline-lg tabular-nums">{money(goal.savedMinor)}</span>
			<span class="text-body-md text-on-surface-variant tabular-nums"
				>{m.goals_of_target({ amount: money(goal.targetMinor) })}</span
			>
		</span>
		<span class="text-title-lg text-primary tabular-nums">{percent}</span>
	</p>
	<div
		class="mt-2 h-3 overflow-hidden rounded-full bg-surface-container-high"
		role="progressbar"
		aria-label={goal.name}
		aria-valuemin={0}
		aria-valuemax={100}
		aria-valuenow={Math.round(progress.permille / 10)}
	>
		<div
			class={['h-full rounded-full', progress.reached ? 'bg-tertiary' : 'bg-primary-container']}
			style:width="{progress.permille / 10}%"
		></div>
	</div>
	<p class="mt-3 text-body-sm text-on-surface-variant">
		{#if progress.reached}
			{m.goals_reached()}
		{:else if progress.overdue}
			{m.goals_overdue()}
		{:else if progress.monthlyMinor}
			{m.goals_per_month({ amount: money(progress.monthlyMinor) })}
		{:else}
			{m.goals_no_date()}
		{/if}
	</p>
</header>

<div class="grid gap-6 lg:grid-cols-2">
	<section class="card" aria-labelledby="money-title">
		<h2 id="money-title" class="text-title-lg">{m.goal_detail_money_title()}</h2>
		<p class="mb-4 text-body-sm text-on-surface-variant">{m.goal_detail_money_hint()}</p>
		<form
			method="POST"
			action="?/money"
			class="space-y-4"
			use:enhance={submit('money', m.goal_money_saved, true)}
		>
			{#if moneyError}<FormError message={moneyError} />{/if}
			<fieldset class="grid grid-cols-2 gap-2 rounded-full bg-surface-container-low p-1">
				<legend class="sr-only">{m.goal_detail_money_title()}</legend>
				{#each [['deposit', m.goal_detail_add], ['withdraw', m.goal_detail_withdraw]] as const as [value, label] (value)}
					<label
						class="cursor-pointer rounded-full px-3 py-2 text-center text-label-lg text-on-surface-variant transition has-checked:bg-surface-container-lowest has-checked:text-on-surface has-checked:shadow-sm"
					>
						<input
							type="radio"
							name="direction"
							{value}
							checked={value === 'deposit'}
							class="sr-only"
						/>{label()}
					</label>
				{/each}
			</fieldset>
			<label class="block space-y-1">
				<span class="text-label-lg">{m.goal_detail_amount()}</span>
				<input name="amount" inputmode="decimal" required placeholder="0" class={inputClass} />
			</label>
			<label class="block space-y-1">
				<span class="text-label-lg">{m.goal_detail_note()}</span>
				<input name="note" maxlength="200" class={inputClass} />
			</label>
			<button
				type="submit"
				disabled={busy !== null}
				aria-busy={busy === 'money'}
				class={primaryButton}
				>{#if busy === 'money'}<Spinner />{/if}{m.goal_detail_save_money()}</button
			>
		</form>
	</section>

	<div class="space-y-6">
		<section class="card" aria-labelledby="edit-title">
			<h2 id="edit-title" class="text-title-lg mb-4">{m.goal_detail_edit_title()}</h2>
			<form
				method="POST"
				action="?/update"
				class="space-y-4"
				use:enhance={submit('update', m.goal_updated)}
			>
				{#if updateError}<FormError message={updateError} />{/if}
				<label class="block space-y-1">
					<span class="text-label-lg">{m.goal_name()}</span>
					<input name="name" required maxlength="80" value={goal.name} class={inputClass} />
				</label>
				<label class="block space-y-1">
					<span class="text-label-lg">{m.goal_target()} ({goal.currency})</span>
					<input
						name="target"
						inputmode="decimal"
						required
						value={targetInput}
						class={inputClass}
					/>
				</label>
				<label class="block space-y-1">
					<span class="text-label-lg">{m.goal_date()}</span>
					<input
						type="date"
						name="targetDate"
						min={data.today}
						value={goal.targetDate ?? ''}
						class={inputClass}
					/>
				</label>
				<button
					type="submit"
					disabled={busy !== null}
					aria-busy={busy === 'update'}
					class={primaryButton}
					>{#if busy === 'update'}<Spinner />{/if}{m.goal_detail_save()}</button
				>
			</form>
		</section>

		<section class="card" aria-labelledby="status-title">
			<h2 id="status-title" class="text-title-lg mb-4">{m.goal_detail_status_title()}</h2>
			<form
				method="POST"
				action="?/status"
				class="flex flex-wrap gap-2"
				use:enhance={submit('status', m.goal_updated)}
			>
				{#each transitions[goal.status] as { to, label } (to)}
					<button
						type="submit"
						name="status"
						value={to}
						disabled={busy !== null}
						class={[
							'rounded-full px-4 py-2 text-label-lg transition disabled:opacity-60',
							to === 'abandoned'
								? 'text-error hover:bg-error-container/50'
								: 'bg-surface-container-high text-on-surface hover:bg-primary-fixed'
						]}>{label()}</button
					>
				{/each}
			</form>
		</section>
	</div>
</div>
