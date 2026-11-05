import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import { describe, expect, it } from 'vitest';
import type { EnvelopeView } from '#lib/budgets.ts';
import EnvelopeCard from './envelope-card.svelte';

const base: EnvelopeView = {
	categoryId: '00000000-0000-7000-8000-000000000001',
	bucket: 'wants',
	limitMinor: 60_000_000,
	spentMinor: 31_000_000,
	remainingMinor: 29_000_000,
	usedPermille: 516,
	state: 'ok',
	onPace: true,
	dailyAllowanceMinor: 2_636_300
};

function renderCard(envelope: Partial<EnvelopeView>) {
	return render(EnvelopeCard, {
		envelope: { ...base, ...envelope },
		category: { name: 'Dining Out', icon: 'utensils' },
		currency: 'COP',
		locale: 'en-US'
	});
}

describe('EnvelopeCard', () => {
	it('shows spending against the limit, the pace and what is left', async () => {
		renderCard({});
		await expect.element(page.getByRole('heading', { name: 'Dining out' })).toBeVisible();
		await expect.element(page.getByText('51.6%')).toBeVisible();
		await expect.element(page.getByText('of $600,000')).toBeVisible();
		await expect.element(page.getByText('On pace · $26,363/day')).toBeVisible();
		await expect.element(page.getByText('$290,000 left')).toBeVisible();
		await expect
			.element(page.getByRole('progressbar', { name: 'Dining out' }))
			.toHaveAttribute('aria-valuenow', '52');
	});

	it('flags an overspent envelope and caps the bar at 100%', async () => {
		renderCard({
			spentMinor: 64_000_000,
			remainingMinor: -4_000_000,
			usedPermille: 1066,
			state: 'over',
			onPace: false,
			dailyAllowanceMinor: 0
		});
		await expect.element(page.getByText('6.6% over')).toBeVisible();
		await expect.element(page.getByText('$40,000 over')).toBeVisible();
		await expect
			.element(page.getByRole('progressbar', { name: 'Dining out' }))
			.toHaveAttribute('aria-valuenow', '100');
		expect(document.querySelector('[data-state="over"]')).not.toBeNull();
	});

	it('warns near the limit', async () => {
		renderCard({
			spentMinor: 50_000_000,
			remainingMinor: 10_000_000,
			usedPermille: 833,
			state: 'warning'
		});
		await expect.element(page.getByText('Near the limit')).toBeVisible();
		await expect.element(page.getByText('83.3%')).toBeVisible();
	});
});
