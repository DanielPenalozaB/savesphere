import { Inject, Injectable } from '@nestjs/common';
import type {
	CreateGoalAllocationInput,
	CreateGoalInput,
	Goal,
	UpdateGoalInput
} from '@savesphere/contracts';
import { goalAllocations, goals, type Database } from '@savesphere/db';
import { and, asc, eq, sql } from 'drizzle-orm';
import { AppError } from '../common/app-error.js';
import { toSafeNumber } from '../common/iso.js';
import { DB } from '../database/database.module.js';
import { pgError, PG_FOREIGN_KEY_VIOLATION } from '../database/pg-errors.js';

type GoalRow = typeof goals.$inferSelect;

@Injectable()
export class GoalsService {
	constructor(@Inject(DB) private readonly db: Database) {}

	/** Goals by priority then age, with progress derived from their allocations. */
	async list(userId: string): Promise<Goal[]> {
		const rows = await this.db
			.select({ goal: goals, saved: savedSum })
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

	async get(userId: string, id: string): Promise<Goal> {
		const [row] = await this.db
			.select({ goal: goals, saved: savedSum })
			.from(goals)
			.leftJoin(
				goalAllocations,
				and(eq(goalAllocations.userId, goals.userId), eq(goalAllocations.goalId, goals.id))
			)
			.where(and(eq(goals.userId, userId), eq(goals.id, id)))
			.groupBy(goals.id);
		if (!row) throw AppError.notFound('Goal');
		return toDto(row.goal, BigInt(row.saved));
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

	async update(userId: string, id: string, input: UpdateGoalInput): Promise<Goal> {
		const [current] = await this.db
			.select({ status: goals.status })
			.from(goals)
			.where(and(eq(goals.userId, userId), eq(goals.id, id)));
		if (!current) throw AppError.notFound('Goal');

		const statusChange =
			input.status && input.status !== current.status
				? { status: input.status, achievedAt: input.status === 'achieved' ? new Date() : null }
				: {};
		await this.db
			.update(goals)
			.set({
				...(input.name !== undefined && { name: input.name }),
				...(input.targetMinor !== undefined && { targetMinor: BigInt(input.targetMinor) }),
				...(input.targetDate !== undefined && { targetDate: input.targetDate }),
				...statusChange
			})
			.where(and(eq(goals.userId, userId), eq(goals.id, id)));
		return this.get(userId, id);
	}

	/**
	 * Sets money aside for a goal (positive) or takes it back (negative). Withdrawals can't take
	 * more than is saved, and abandoned goals take no new money.
	 */
	async allocate(userId: string, id: string, input: CreateGoalAllocationInput): Promise<Goal> {
		await this.db.transaction(async (tx) => {
			// Locks the goal so concurrent withdrawals can't both pass the balance check.
			const [goal] = await tx
				.select({ status: goals.status })
				.from(goals)
				.where(and(eq(goals.userId, userId), eq(goals.id, id)))
				.for('update');
			if (!goal) throw AppError.notFound('Goal');
			if (goal.status === 'abandoned')
				throw AppError.conflict('An abandoned goal cannot receive money');

			if (input.amountMinor < 0) {
				const [{ saved } = { saved: '0' }] = await tx
					.select({ saved: sql<string>`coalesce(sum(${goalAllocations.amountMinor}), 0)` })
					.from(goalAllocations)
					.where(and(eq(goalAllocations.userId, userId), eq(goalAllocations.goalId, id)));
				if (BigInt(saved) + BigInt(input.amountMinor) < 0n)
					throw AppError.validation('Cannot withdraw more than is saved in the goal');
			}

			await tx.insert(goalAllocations).values({
				userId,
				goalId: id,
				amountMinor: BigInt(input.amountMinor),
				allocatedOn: input.allocatedOn ?? new Date().toISOString().slice(0, 10),
				note: input.note || null
			});
		});
		return this.get(userId, id);
	}
}

const savedSum = sql<string>`coalesce(sum(${goalAllocations.amountMinor}), 0)`;

function toDto(row: GoalRow, saved: bigint): Goal {
	return {
		id: row.id,
		name: row.name,
		targetMinor: toSafeNumber(row.targetMinor),
		savedMinor: toSafeNumber(saved),
		currency: row.currency,
		targetDate: row.targetDate,
		status: row.status,
		icon: row.icon,
		achievedAt: row.achievedAt?.toISOString() ?? null,
		createdAt: row.createdAt.toISOString()
	};
}
