import { createRawSnippet } from 'svelte';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import { describe, expect, it } from 'vitest';
import AiGate from './ai-gate.svelte';

const children = createRawSnippet(() => ({
	render: () => '<button type="button">Scan receipt</button>'
}));

describe('AiGate', () => {
	it('renders the feature normally when AI is available', async () => {
		render(AiGate, {
			ai: { available: true, reason: null, source: 'user' },
			feature: 'Receipt scanning',
			children
		});
		await expect.element(page.getByRole('button', { name: 'Scan receipt' })).toBeEnabled();
		expect(document.querySelector('[data-ai-locked]')).toBeNull();
	});

	it('keeps the feature visible but locked, and explains why on tap', async () => {
		render(AiGate, {
			ai: { available: false, reason: 'disabled_by_user', source: null },
			feature: 'Receipt scanning',
			children
		});
		expect(document.querySelector('[data-ai-locked] [inert]')?.textContent).toContain(
			'Scan receipt'
		);

		await page.getByRole('button', { name: 'Receipt scanning needs AI' }).click();
		await expect.element(page.getByRole('status')).toHaveTextContent('You turned AI off');
		await expect
			.element(page.getByRole('link', { name: 'Open AI settings' }))
			.toHaveAttribute('href', '/settings/ai');
	});
});
