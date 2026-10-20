import { Inject, Injectable } from '@nestjs/common';
import type { Account, CreateAccountInput, UpdateAccountInput } from '@savesphere/contracts';
import { buildEntries } from '@savesphere/core';
import { accounts, transactionEntries, transactions, type Database } from '@savesphere/db';
import { and, asc, eq, sql } from 'drizzle-orm';
import { AppError } from '../common/app-error.js';
import { iso, toSafeNumber } from '../common/iso.js';
import { DB } from '../database/database.module.js';
import { pgError, PG_FOREIGN_KEY_VIOLATION, PG_UNIQUE_VIOLATION } from '../database/pg-errors.js';

type AccountRow = typeof accounts.$inferSelect;

/** Balances are always derived from ledger entries, never stored. */
const balance =
	sql<bigint>`coalesce(sum(${transactionEntries.amountMinor}) filter (where ${transactions.deletedAt} is null), 0)`.mapWith(
		(value: string | number) => BigInt(value)
	);

@Injectable()
export class AccountsService {
	constructor(@Inject(DB) private readonly db: Database) {}

	async list(userId: string): Promise<Account[]> {
		const rows = await this.query(userId).orderBy(asc(accounts.createdAt));
		return rows.map(({ account, balanceMinor }) => toDto(account, balanceMinor));
	}

	async get(userId: string, id: string): Promise<Account> {
		const [row] = await this.query(userId, id);
		if (!row) throw AppError.notFound('Account');
		return toDto(row.account, row.balanceMinor);
	}

	async create(userId: string, input: CreateAccountInput): Promise<Account> {
		try {
			const id = await this.db.transaction(async (tx) => {
				const [account] = await tx
					.insert(accounts)
					.values({
						userId,
						name: input.name,
						kind: input.kind,
						currency: input.currency,
						includeInTotals: input.includeInTotals
					})
					.returning({ id: accounts.id });

				if (input.openingBalanceMinor) {
					const [opening] = await tx
						.insert(transactions)
						.values({
							userId,
							kind: 'adjustment',
							occurredAt: new Date(),
							description: 'Opening balance'
						})
						.returning({ id: transactions.id });
					const entries = buildEntries({
						kind: 'adjustment',
						accountId: account!.id,
						amountMinor: BigInt(input.openingBalanceMinor)
					});
					await tx
						.insert(transactionEntries)
						.values(entries.map((entry) => ({ userId, transactionId: opening!.id, ...entry })));
				}
				return account!.id;
			});
			return this.get(userId, id);
		} catch (error) {
			const pg = pgError(error);
			if (pg?.code === PG_UNIQUE_VIOLATION)
				throw AppError.conflict('An account with this name already exists');
			if (pg?.code === PG_FOREIGN_KEY_VIOLATION) throw AppError.validation('Unsupported currency');
			throw error;
		}
	}

	async update(userId: string, id: string, input: UpdateAccountInput): Promise<Account> {
		const changes: Partial<typeof accounts.$inferInsert> = {};
		if (input.name !== undefined) changes.name = input.name;
		if (input.includeInTotals !== undefined) changes.includeInTotals = input.includeInTotals;
		if (input.archived !== undefined) changes.archivedAt = input.archived ? new Date() : null;

		if (Object.keys(changes).length > 0) {
			try {
				const updated = await this.db
					.update(accounts)
					.set(changes)
					.where(and(eq(accounts.userId, userId), eq(accounts.id, id)))
					.returning({ id: accounts.id });
				if (updated.length === 0) throw AppError.notFound('Account');
			} catch (error) {
				if (pgError(error)?.code === PG_UNIQUE_VIOLATION) {
					throw AppError.conflict('An account with this name already exists');
				}
				throw error;
			}
		}
		return this.get(userId, id);
	}

	private query(userId: string, id?: string) {
		return this.db
			.select({ account: accounts, balanceMinor: balance })
			.from(accounts)
			.leftJoin(transactionEntries, eq(transactionEntries.accountId, accounts.id))
			.leftJoin(transactions, eq(transactions.id, transactionEntries.transactionId))
			.where(and(eq(accounts.userId, userId), id ? eq(accounts.id, id) : undefined))
			.groupBy(accounts.id)
			.$dynamic();
	}
}

function toDto(account: AccountRow, balanceMinor: bigint): Account {
	return {
		id: account.id,
		name: account.name,
		kind: account.kind,
		currency: account.currency,
		includeInTotals: account.includeInTotals,
		balanceMinor: toSafeNumber(balanceMinor),
		archivedAt: iso(account.archivedAt),
		createdAt: account.createdAt.toISOString()
	};
}
