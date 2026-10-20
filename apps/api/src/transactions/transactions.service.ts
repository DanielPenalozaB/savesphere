import { Inject, Injectable } from '@nestjs/common';
import type {
	CreateTransactionInput,
	ListTransactionsQuery,
	Transaction,
	TransactionPage
} from '@savesphere/contracts';
import { buildEntries, type TransactionDraft } from '@savesphere/core';
import {
	accounts,
	categories,
	transactionEntries,
	transactions,
	type Database
} from '@savesphere/db';
import { and, desc, eq, exists, gte, inArray, isNull, lt, lte, or, sql } from 'drizzle-orm';
import { AppError } from '../common/app-error.js';
import { toSafeNumber } from '../common/iso.js';
import { DB } from '../database/database.module.js';
import { pgError, PG_UNIQUE_VIOLATION } from '../database/pg-errors.js';
import { decodeCursor, encodeCursor } from './cursor.js';

type TransactionRow = typeof transactions.$inferSelect;
type EntryRow = Pick<
	typeof transactionEntries.$inferSelect,
	'transactionId' | 'accountId' | 'amountMinor'
>;

@Injectable()
export class TransactionsService {
	constructor(@Inject(DB) private readonly db: Database) {}

	async create(userId: string, input: CreateTransactionInput): Promise<Transaction> {
		if (input.clientRef) {
			const existing = await this.findByClientRef(userId, input.clientRef);
			if (existing) return existing;
		}

		const draft = await this.toDraft(userId, input);
		const entries = buildEntries(draft);

		try {
			const id = await this.db.transaction(async (tx) => {
				const [row] = await tx
					.insert(transactions)
					.values({
						userId,
						kind: input.kind,
						categoryId: 'categoryId' in input ? input.categoryId : null,
						occurredAt: new Date(input.occurredAt),
						description: input.description ?? null,
						note: input.note ?? null,
						clientRef: input.clientRef ?? null
					})
					.returning({ id: transactions.id });
				await tx
					.insert(transactionEntries)
					.values(entries.map((entry) => ({ userId, transactionId: row!.id, ...entry })));
				return row!.id;
			});
			return this.get(userId, id);
		} catch (error) {
			// Two concurrent retries with the same clientRef: the loser returns the winner's row.
			if (input.clientRef && pgError(error)?.code === PG_UNIQUE_VIOLATION) {
				const existing = await this.findByClientRef(userId, input.clientRef);
				if (existing) return existing;
			}
			throw error;
		}
	}

	async get(userId: string, id: string): Promise<Transaction> {
		const [row] = await this.db
			.select()
			.from(transactions)
			.where(
				and(
					eq(transactions.userId, userId),
					eq(transactions.id, id),
					isNull(transactions.deletedAt)
				)
			);
		if (!row) throw AppError.notFound('Transaction');
		const [dto] = await this.withEntries([row]);
		return dto!;
	}

	async list(userId: string, query: ListTransactionsQuery): Promise<TransactionPage> {
		const cursor = query.cursor ? decodeCursor(query.cursor) : null;
		if (query.cursor && !cursor) throw AppError.validation('Invalid cursor');

		const rows = await this.db
			.select()
			.from(transactions)
			.where(
				and(
					eq(transactions.userId, userId),
					isNull(transactions.deletedAt),
					query.kind ? eq(transactions.kind, query.kind) : undefined,
					query.categoryId ? eq(transactions.categoryId, query.categoryId) : undefined,
					query.from ? gte(transactions.occurredAt, new Date(query.from)) : undefined,
					query.to ? lte(transactions.occurredAt, new Date(query.to)) : undefined,
					query.accountId
						? exists(
								this.db
									.select({ one: sql`1` })
									.from(transactionEntries)
									.where(
										and(
											eq(transactionEntries.transactionId, transactions.id),
											eq(transactionEntries.accountId, query.accountId)
										)
									)
							)
						: undefined,
					cursor
						? or(
								lt(transactions.occurredAt, cursor.occurredAt),
								and(eq(transactions.occurredAt, cursor.occurredAt), lt(transactions.id, cursor.id))
							)
						: undefined
				)
			)
			.orderBy(desc(transactions.occurredAt), desc(transactions.id))
			.limit(query.limit + 1);

		const page = rows.slice(0, query.limit);
		const last = page.at(-1);
		return {
			items: await this.withEntries(page),
			nextCursor: rows.length > query.limit && last ? encodeCursor(last) : null
		};
	}

	async remove(userId: string, id: string): Promise<void> {
		const deleted = await this.db
			.update(transactions)
			.set({ deletedAt: new Date() })
			.where(
				and(
					eq(transactions.userId, userId),
					eq(transactions.id, id),
					isNull(transactions.deletedAt)
				)
			)
			.returning({ id: transactions.id });
		if (deleted.length === 0) throw AppError.notFound('Transaction');
	}

	/** Checks ownership, category kind and currencies, then maps the request to a ledger draft. */
	private async toDraft(userId: string, input: CreateTransactionInput): Promise<TransactionDraft> {
		if (input.kind === 'expense' || input.kind === 'income') {
			await this.requireAccounts(userId, [input.accountId]);
			const [category] = await this.db
				.select({ kind: categories.kind })
				.from(categories)
				.where(and(eq(categories.userId, userId), eq(categories.id, input.categoryId)));
			if (!category) throw AppError.notFound('Category');
			if (category.kind !== input.kind) {
				throw AppError.validation(
					`Category is not an ${input.kind === 'expense' ? 'expense' : 'income'} category`
				);
			}
			return {
				kind: input.kind,
				accountId: input.accountId,
				amountMinor: BigInt(input.amountMinor)
			};
		}

		if (input.kind === 'adjustment') {
			await this.requireAccounts(userId, [input.accountId]);
			return {
				kind: 'adjustment',
				accountId: input.accountId,
				amountMinor: BigInt(input.amountMinor)
			};
		}

		const found = await this.requireAccounts(userId, [input.fromAccountId, input.toAccountId]);
		const from = found.get(input.fromAccountId)!;
		const to = found.get(input.toAccountId)!;
		if (
			from.currency === to.currency &&
			input.toAmountMinor !== undefined &&
			input.toAmountMinor !== input.amountMinor
		) {
			throw AppError.validation('toAmountMinor must match amountMinor for same-currency transfers');
		}
		if (from.currency !== to.currency && input.toAmountMinor === undefined) {
			throw AppError.validation('toAmountMinor is required for cross-currency transfers');
		}
		return {
			kind: 'transfer',
			fromAccountId: input.fromAccountId,
			toAccountId: input.toAccountId,
			amountMinor: BigInt(input.amountMinor),
			toAmountMinor: input.toAmountMinor === undefined ? undefined : BigInt(input.toAmountMinor)
		};
	}

	private async requireAccounts(userId: string, ids: string[]) {
		const rows = await this.db
			.select({ id: accounts.id, currency: accounts.currency, archivedAt: accounts.archivedAt })
			.from(accounts)
			.where(and(eq(accounts.userId, userId), inArray(accounts.id, ids)));
		const found = new Map(rows.map((row) => [row.id, row]));
		for (const id of ids) {
			const account = found.get(id);
			if (!account) throw AppError.notFound('Account');
			if (account.archivedAt)
				throw AppError.validation('Cannot record movements on an archived account');
		}
		return found;
	}

	private async findByClientRef(userId: string, clientRef: string): Promise<Transaction | null> {
		const [row] = await this.db
			.select()
			.from(transactions)
			.where(and(eq(transactions.userId, userId), eq(transactions.clientRef, clientRef)));
		if (!row) return null;
		const [dto] = await this.withEntries([row]);
		return dto!;
	}

	private async withEntries(rows: TransactionRow[]): Promise<Transaction[]> {
		if (rows.length === 0) return [];
		const entries = await this.db
			.select({
				transactionId: transactionEntries.transactionId,
				accountId: transactionEntries.accountId,
				amountMinor: transactionEntries.amountMinor
			})
			.from(transactionEntries)
			.where(
				inArray(
					transactionEntries.transactionId,
					rows.map((row) => row.id)
				)
			);

		const byTransaction = new Map<string, EntryRow[]>();
		for (const entry of entries) {
			byTransaction.set(entry.transactionId, [
				...(byTransaction.get(entry.transactionId) ?? []),
				entry
			]);
		}
		return rows.map((row) => ({
			id: row.id,
			kind: row.kind,
			categoryId: row.categoryId,
			occurredAt: row.occurredAt.toISOString(),
			description: row.description,
			note: row.note,
			source: row.source,
			entries: (byTransaction.get(row.id) ?? [])
				.sort((a, b) => (a.amountMinor < b.amountMinor ? -1 : 1))
				.map((entry) => ({
					accountId: entry.accountId,
					amountMinor: toSafeNumber(entry.amountMinor)
				})),
			createdAt: row.createdAt.toISOString()
		}));
	}
}
