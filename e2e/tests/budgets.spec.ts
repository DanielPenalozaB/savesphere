import { expect, test } from './fixtures';

test('create a budget, see envelopes against spending, then adjust it', async ({ page, user }) => {
	const account = await user.api.post('/api/accounts', {
		data: { name: 'Main checking', kind: 'checking', currency: 'COP' }
	});
	expect(account.ok()).toBe(true);
	const accountId = (await account.json()).data.id as string;
	const categories = (await (await user.api.get('/api/categories')).json()).data as {
		id: string;
		name: string;
	}[];
	const dining = categories.find((c) => c.name === 'Dining Out')!.id;
	const spent = await user.api.post('/api/transactions', {
		data: {
			kind: 'expense',
			accountId,
			categoryId: dining,
			amountMinor: 2_500_000,
			occurredAt: new Date().toISOString()
		}
	});
	expect(spent.ok()).toBe(true);

	await page.goto('/budgets');
	await expect(page.getByRole('heading', { name: 'Plan your month with envelopes' })).toBeVisible();
	await page.getByRole('link', { name: 'Create budget' }).click();
	await expect(page).toHaveURL('/budgets/edit');

	await page.getByLabel('Currency').selectOption('COP');
	await page.getByLabel('Monthly limit for Housing').fill('2,000,000');
	await page.getByLabel('Monthly limit for Dining out').fill('20,000');
	await expect(page.getByLabel('Group for Dining out')).toHaveValue('wants');
	await page.getByRole('button', { name: 'Save budget' }).click();

	await expect(page).toHaveURL('/budgets');
	const kpi = (name: string) =>
		page.getByRole('article').filter({ has: page.getByRole('heading', { name, exact: true }) });
	await expect(kpi('Total monthly limit')).toContainText('$2,020,000');
	await expect(kpi('Actual spending')).toContainText('$25,000');

	const essentials = page.getByRole('region', { name: /Essentials/ });
	await expect(essentials.getByRole('heading', { name: 'Housing' })).toBeVisible();
	const lifestyle = page.getByRole('region', { name: /Discretionary/ });
	await expect(lifestyle).toContainText('25% over');
	await expect(lifestyle).toContainText('$5,000 over');

	// Raising the limit clears the overspend.
	await page.getByRole('link', { name: 'Adjust envelopes' }).click();
	await expect(page.getByLabel('Monthly limit for Dining out')).toHaveValue('20,000');
	await page.getByLabel('Monthly limit for Dining out').fill('100,000');
	await page.getByRole('button', { name: 'Save budget' }).click();
	await expect(page).toHaveURL('/budgets');
	await expect(lifestyle).toContainText('$75,000 left');
	await expect(lifestyle).not.toContainText('over');
});
