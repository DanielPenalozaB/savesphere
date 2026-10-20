import { DEFAULT_CATEGORIES, categories, userSettings, type Database } from '@savesphere/db';

/** Creates the per-user defaults (settings + starter categories) right after sign-up. */
export async function provisionUser(db: Database, userId: string): Promise<void> {
	await db.transaction(async (tx) => {
		await tx.insert(userSettings).values({ userId, baseCurrency: 'USD' }).onConflictDoNothing();
		await tx
			.insert(categories)
			.values([
				...DEFAULT_CATEGORIES.expense.map((c) => ({ userId, kind: 'expense' as const, ...c })),
				...DEFAULT_CATEGORIES.income.map((c) => ({ userId, kind: 'income' as const, ...c }))
			])
			.onConflictDoNothing();
	});
}
