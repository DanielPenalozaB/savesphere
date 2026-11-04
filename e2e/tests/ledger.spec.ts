import { expect, test } from './fixtures';

test('first account, record movements, see them on the Panel and in Activity', async ({
	page,
	user
}) => {
	expect(user.email).toBeTruthy();
	await page.goto('/');

	// New users start by creating an account; it also sets the reporting currency.
	await page.getByLabel('Account name').fill('Main checking');
	await page.getByLabel('Currency').selectOption('COP');
	await page.getByLabel('Current balance').fill('1,000,000');
	await page.getByRole('button', { name: 'Create account' }).click();
	await expect(page.getByText('Currency: COP')).toBeVisible();

	const record = async (kind: string, amount: string, category: string, description: string) => {
		await page.getByRole('link', { name: 'Record movement' }).first().click();
		const sheet = page.getByRole('dialog', { name: 'New movement' });
		await sheet.getByText(kind, { exact: true }).click();
		await sheet.getByLabel('Amount').fill(amount);
		await sheet.getByText(category, { exact: true }).click();
		await sheet.getByLabel('Description').fill(description);
		await sheet.getByRole('button', { name: 'Save movement' }).click();
		await expect(sheet).toBeHidden();
	};
	await record('Income', '3,500,000', 'Salary', 'October salary');
	await record('Expense', '25,000', 'Dining out', 'Lunch');

	const kpi = (name: string) =>
		page.getByRole('article').filter({ has: page.getByRole('heading', { name, exact: true }) });
	await expect(kpi('Expenses')).toContainText('$25,000');
	await expect(kpi('Left this month')).toContainText('+$3,475,000');
	await expect(kpi('Available balance')).toContainText('$4,475,000');

	await page.getByRole('link', { name: 'View all' }).click();
	await expect(page).toHaveURL(/\/activity/);
	// The count matches the list: the opening balance counts too.
	await expect(page.getByText('3 movements')).toBeVisible();
	const lunch = page.getByRole('row').filter({ hasText: 'Lunch' });
	await expect(lunch).toContainText('-$25,000');

	await page.getByRole('link', { name: 'Expense', exact: true }).click();
	await expect(page.getByRole('row').filter({ hasText: 'October salary' })).toHaveCount(0);

	await lunch.getByLabel('Actions for Lunch').click();
	await lunch.getByRole('button', { name: 'Delete' }).click();
	await expect(page.getByText('No movements this month yet.')).toBeVisible();
});

test.describe('without JavaScript', () => {
	test.use({ javaScriptEnabled: false });

	test('a movement can be recorded with the full-page form', async ({ page, user }) => {
		expect(user.email).toBeTruthy();
		await page.request.post('/api/accounts', {
			data: { name: 'Wallet', kind: 'cash', currency: 'USD' }
		});
		await page.goto('/activity/new');
		await page.getByLabel('Amount').fill('12.50');
		await page.getByText('Transport', { exact: true }).click();
		await page.getByRole('button', { name: 'Save movement' }).click();
		await expect(page).toHaveURL('/activity');
		await expect(page.getByRole('row').filter({ hasText: 'Transport' })).toContainText('-$12.50');
	});
});
