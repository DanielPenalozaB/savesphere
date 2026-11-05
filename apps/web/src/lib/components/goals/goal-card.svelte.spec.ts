import type { Goal } from '@savesphere/contracts';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import { describe, expect, it } from 'vitest';
import { goalProgress } from '#lib/goals.ts';
import GoalCard from './goal-card.svelte';

const goal = (overrides: Partial<Goal>): Goal => ({
	id: '00000000-0000-7000-8000-000000000001',
	name: 'Trip to Kyoto',
	targetMinor: 800_000_000,
	savedMinor: 560_000_000,
	currency: 'COP',
	targetDate: '2027-06-30',
	status: 'active',
	icon: null,
	achievedAt: null,
	createdAt: '2026-01-01T00:00:00.000Z',
	...overrides
});

function renderCard(value: Goal) {
	return render(GoalCard, {
		goal: value,
		progress: goalProgress(value, '2026-11-05'),
		locale: 'en-US'
	});
}

describe('GoalCard', () => {
	it('shows progress, the due date and the monthly amount needed', async () => {
		renderCard(goal({}));
		await expect.element(page.getByRole('heading', { name: 'Trip to Kyoto' })).toBeVisible();
		await expect.element(page.getByText('$5,600,000')).toBeVisible();
		await expect.element(page.getByText('of $8,000,000')).toBeVisible();
		await expect.element(page.getByText('70%')).toBeVisible();
		await expect.element(page.getByText('Due Jun 2027')).toBeVisible();
		await expect.element(page.getByText('$300,000/month')).toBeVisible();
		await expect
			.element(page.getByRole('link', { name: 'Manage Trip to Kyoto' }))
			.toHaveAttribute('href', '/goals/00000000-0000-7000-8000-000000000001');
	});

	it('marks a funded goal and caps the bar', async () => {
		renderCard(goal({ savedMinor: 900_000_000 }));
		await expect.element(page.getByText('Fully funded')).toBeVisible();
		await expect
			.element(page.getByRole('progressbar', { name: 'Trip to Kyoto' }))
			.toHaveAttribute('aria-valuenow', '100');
	});

	it('shows the status of a paused goal and goals without a date', async () => {
		renderCard(goal({ status: 'paused', targetDate: null }));
		await expect.element(page.getByText('Paused')).toBeVisible();
		await expect.element(page.getByText('No target date')).toBeVisible();
	});
});
