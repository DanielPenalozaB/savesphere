import { expect, test } from './fixtures';

test('create a goal, add and withdraw money, edit it and mark it achieved', async ({
	page,
	user
}) => {
	const account = await user.api.post('/api/accounts', {
		data: { name: 'Main checking', kind: 'checking', currency: 'USD', openingBalanceMinor: 500_000 }
	});
	expect(account.ok()).toBe(true);
	const card = await user.api.post('/api/accounts', {
		data: { name: 'Visa', kind: 'credit_card', currency: 'USD', openingBalanceMinor: -120_000 }
	});
	expect(card.ok()).toBe(true);

	await page.goto('/goals');
	const balance = page.getByRole('region', { name: 'Balance sheet' });
	await expect(balance).toContainText('Assets: $5,000');
	await expect(balance).toContainText('Debts: $1,200');
	await expect(
		page.getByRole('article').filter({ has: page.getByRole('heading', { name: 'Net worth' }) })
	).toContainText('$3,800');

	await page.getByRole('link', { name: 'New goal', exact: true }).click();
	await page.getByLabel('Name').fill('Emergency fund');
	await page.getByLabel('Target amount').fill('3,000');
	await page.getByRole('button', { name: 'Create vault' }).click();
	await expect(page).toHaveURL('/goals');

	await page.getByRole('link', { name: 'Manage Emergency fund' }).click();
	await expect(page.getByRole('heading', { name: 'Emergency fund', level: 1 })).toBeVisible();

	await page.getByLabel('Amount', { exact: true }).fill('1,000');
	await page.getByRole('button', { name: 'Save movement' }).click();
	await expect(page.getByText('$1,000', { exact: true })).toBeVisible();

	// Can't take out more than is saved.
	await page.getByText('Take money out', { exact: true }).click();
	await page.getByLabel('Amount', { exact: true }).fill('1,500');
	await page.getByRole('button', { name: 'Save movement' }).click();
	await expect(page.getByRole('alert')).toHaveText(/more than is saved/);

	await page.getByLabel('Amount', { exact: true }).fill('250');
	await page.getByRole('button', { name: 'Save movement' }).click();
	await expect(page.getByText('$750', { exact: true })).toBeVisible();

	await page.getByLabel('Target amount (USD)').fill('750');
	await page.getByRole('button', { name: 'Save changes' }).click();
	await expect(page.getByText('Fully funded')).toBeVisible();

	await page.getByRole('button', { name: 'Mark as achieved' }).click();
	await expect(page.getByRole('button', { name: 'Reopen' })).toBeVisible();

	await page.getByRole('link', { name: 'Back to goals' }).click();
	const finished = page.getByRole('region', { name: 'Paused & finished' });
	await expect(finished.getByRole('heading', { name: 'Emergency fund' })).toBeVisible();
	await expect(finished).toContainText('Achieved');
});
