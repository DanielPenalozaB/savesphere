import { Inject, Injectable } from '@nestjs/common';
import {
	budgetLimitSchema,
	type Budget,
	type BudgetLimitInput,
	type BudgetSpending,
	type BudgetSpendingQuery,
	type CreateBudgetInput,
	type UpdateBudgetInput
} from '@savesphere/contracts';
import {
	accounts,
	budgetLimits,
	budgets,
	categories,
	transactionEntries,
	transactions,
	type Database
} from '@savesphere/db';
import { and, asc, eq, gte, inArray, isNull, lt, or, sql } from 'drizzle-orm';
import { AppError } from '../common/app-error.js';
import { toSafeNumber } from '../common/iso.js';
import { DB } from '../database/database.module.js';
import { pgError, PG_FOREIGN_KEY_VIOLATION } from '../database/pg-errors.js';

type BudgetRow = typeof budgets.$inferSelect;
type LimitRow = typeof budgetLimits.$inferSelect;
type Tx = Parameters<Parameters<Database['transaction']>[0]>[0];

@Injectable()
export class BudgetsService {
	constructor(@Inject(DB) private readonly db: Database) {}

	/** The user's budgets, oldest first, each with its envelopes. */
	async list(userId: string): Promise<Budget[]> {
		const rows = await this.db
			.select()
			.from(budgets)
			.where(eq(budgets.userId, userId))
			.orderBy(asc(budgets.createdAt), asc(budgets.id));
		if (rows.length === 0) return [];
		const limits = await this.db
			.select()
			.from(budgetLimits)
			.where(
				and(
					eq(budgetLimits.userId, userId),
					inArray(
						budgetLimits.budgetId,
						rows.map((row) => row.id)
					)
				)
			);
		return rows.map((row) =>
			toDto(
				row,
				limits.filter((limit) => limit.budgetId === row.id)
			)
		);
	}

	async create(userId: string, input: CreateBudgetInput): Promise<Budget> {
		const limits = parseLimits(input.limits);
		await this.assertExpenseCategories(userId, limits);
		try {
			return await this.db.transaction(async (tx) => {
				const [row] = await tx
					.insert(budgets)
					.values({
						userId,
						name: input.name,
						period: 'monthly',
						currency: input.currency,
						startsOn: input.startsOn ?? new Date().toISOString().slice(0, 10)
					})
					.returning();
				const inserted = await insertLimits(tx, userId, row!.id, limits);
				return toDto(row!, inserted);
			});
		} catch (error) {
			if (pgError(error)?.code === PG_FOREIGN_KEY_VIOLATION)
				throw AppError.validation('Unsupported currency');
			throw error;
		}
	}

	async update(userId: string, id: string, input: UpdateBudgetInput): Promise<Budget> {
		const limits = parseLimits(input.limits);
		await this.assertExpenseCategories(userId, limits);
		return this.db.transaction(async (tx) => {
			const [row] = await tx
				.update(budgets)
				.set({ name: input.name })
				.where(and(eq(budgets.userId, userId), eq(budgets.id, id)))
				.returning();
			if (!row) throw AppError.notFound('Budget');
			await tx
				.delete(budgetLimits)
				.where(and(eq(budgetLimits.userId, userId), eq(budgetLimits.budgetId, id)));
			const inserted = await insertLimits(tx, userId, id, limits);
			return toDto(row, inserted);
		});
	}

	async remove(userId: string, id: string): Promise<void> {
		const deleted = await this.db
			.delete(budgets)
			.where(and(eq(budgets.userId, userId), eq(budgets.id, id)))
			.returning({ id: budgets.id });
		if (deleted.length === 0) throw AppError.notFound('Budget');
	}

	/**
	 * Expenses per envelope in `[from, to)`. Only accounts in the budget's currency count (amounts
	 * are never converted), and an envelope includes its category's direct subcategories.
	 */
	async spending(userId: string, id: string, query: BudgetSpendingQuery): Promise<BudgetSpending> {
		const [budget] = await this.db
			.select({ id: budgets.id, currency: budgets.currency })
			.from(budgets)
			.where(and(eq(budgets.userId, userId), eq(budgets.id, id)));
		if (!budget) throw AppError.notFound('Budget');

		const rows = await this.db
			.select({
				categoryId: budgetLimits.categoryId,
				spent: sql<string>`coalesce(-sum(${transactionEntries.amountMinor}), 0)`
			})
			.from(budgetLimits)
			.innerJoin(
				categories,
				and(
					eq(categories.userId, budgetLimits.userId),
					or(
						eq(categories.id, budgetLimits.categoryId),
						eq(categories.parentId, budgetLimits.categoryId)
					)
				)
			)
			.innerJoin(
				transactions,
				and(
					eq(transactions.userId, categories.userId),
					eq(transactions.categoryId, categories.id),
					eq(transactions.kind, 'expense'),
					isNull(transactions.deletedAt),
					gte(transactions.occurredAt, new Date(query.from)),
					lt(transactions.occurredAt, new Date(query.to))
				)
			)
			.innerJoin(
				transactionEntries,
				and(
					eq(transactionEntries.userId, transactions.userId),
					eq(transactionEntries.transactionId, transactions.id)
				)
			)
			.innerJoin(
				accounts,
				and(
					eq(accounts.userId, transactionEntries.userId),
					eq(accounts.id, transactionEntries.accountId),
					eq(accounts.currency, budget.currency)
				)
			)
			.where(and(eq(budgetLimits.userId, userId), eq(budgetLimits.budgetId, id)))
			.groupBy(budgetLimits.categoryId);

		const spent = new Map(rows.map((row) => [row.categoryId, BigInt(row.spent)]));
		const limits = await this.db
			.select({ categoryId: budgetLimits.categoryId })
			.from(budgetLimits)
			.where(and(eq(budgetLimits.userId, userId), eq(budgetLimits.budgetId, id)));
		return {
			budgetId: budget.id,
			currency: budget.currency,
			envelopes: limits.map(({ categoryId }) => ({
				categoryId,
				spentMinor: toSafeNumber(spent.get(categoryId) ?? 0n)
			}))
		};
	}

	/** Envelopes must point at the user's own, active expense categories. */
	private async assertExpenseCategories(userId: string, limits: { categoryId: string }[]) {
		const ids = limits.map((limit) => limit.categoryId);
		const found = await this.db
			.select({ id: categories.id })
			.from(categories)
			.where(
				and(
					eq(categories.userId, userId),
					inArray(categories.id, ids),
					eq(categories.kind, 'expense'),
					isNull(categories.archivedAt)
				)
			);
		if (found.length !== new Set(ids).size)
			throw AppError.validation('Envelopes need active expense categories');
	}
}

/** Applies the schema defaults (e.g. the alert threshold) to already-validated input. */
function parseLimits(limits: BudgetLimitInput[]) {
	return limits.map((limit) => budgetLimitSchema.parse(limit));
}

async function insertLimits(
	tx: Tx,
	userId: string,
	budgetId: string,
	limits: ReturnType<typeof parseLimits>
): Promise<LimitRow[]> {
	return tx
		.insert(budgetLimits)
		.values(
			limits.map((limit) => ({
				userId,
				budgetId,
				categoryId: limit.categoryId,
				limitMinor: BigInt(limit.limitMinor),
				bucket: limit.bucket,
				alertThresholdPct: limit.alertThresholdPct
			}))
		)
		.returning();
}

function toDto(row: BudgetRow, limits: LimitRow[]): Budget {
	return {
		id: row.id,
		name: row.name,
		period: row.period,
		currency: row.currency,
		startsOn: row.startsOn,
		endsOn: row.endsOn,
		limits: limits.map((limit) => ({
			categoryId: limit.categoryId,
			limitMinor: toSafeNumber(limit.limitMinor),
			bucket: limit.bucket,
			alertThresholdPct: limit.alertThresholdPct
		})),
		createdAt: row.createdAt.toISOString()
	};
}
