import { Inject, Injectable } from '@nestjs/common';
import type { CreateGoalInput, Goal } from '@savesphere/contracts';
import { goalAllocations, goals, type Database } from '@savesphere/db';
import { and, asc, eq, sql } from 'drizzle-orm';
import { AppError } from '../common/app-error.js';
import { toSafeNumber } from '../common/iso.js';
import { DB } from '../database/database.module.js';
import { pgError, PG_FOREIGN_KEY_VIOLATION } from '../database/pg-errors.js';

@Injectable()
export class GoalsService {
	constructor(@Inject(DB) private readonly db: Database) {}

	/** Goals by priority then age, with progress derived from their allocations. */
	async list(userId: string): Promise<Goal[]> {
		const rows = await this.db
			.select({
				goal: goals,
				saved: sql<string>`coalesce(sum(${goalAllocations.amountMinor}), 0)`
			})
			.from(goals)
			.leftJoin(
				goalAllocations,
				and(eq(goalAllocations.userId, goals.userId), eq(goalAllocations.goalId, goals.id))
			)
			.where(eq(goals.userId, userId))
			.groupBy(goals.id)
			.orderBy(asc(goals.priority), asc(goals.createdAt));
		return rows.map(({ goal, saved }) => toDto(goal, BigInt(saved)));
	}

	async create(userId: string, input: CreateGoalInput): Promise<Goal> {
		try {
			const [row] = await this.db
				.insert(goals)
				.values({
					userId,
					name: input.name,
					targetMinor: BigInt(input.targetMinor),
					currency: input.currency,
					targetDate: input.targetDate ?? null
				})
				.returning();
			return toDto(row!, 0n);
		} catch (error) {
			if (pgError(error)?.code === PG_FOREIGN_KEY_VIOLATION)
				throw AppError.validation('Unsupported currency');
			throw error;
		}
	}
}

function toDto(row: typeof goals.$inferSelect, saved: bigint): Goal {
	return {
		id: row.id,
		name: row.name,
		targetMinor: toSafeNumber(row.targetMinor),
		savedMinor: toSafeNumber(saved),
		currency: row.currency,
		targetDate: row.targetDate,
		status: row.status,
		icon: row.icon,
		createdAt: row.createdAt.toISOString()
	};
}
