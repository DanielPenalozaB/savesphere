import { Inject, Injectable } from '@nestjs/common';
import type { Category, CreateCategoryInput } from '@savesphere/contracts';
import { categories, type Database } from '@savesphere/db';
import { and, asc, eq } from 'drizzle-orm';
import { AppError } from '../common/app-error.js';
import { iso } from '../common/iso.js';
import { DB } from '../database/database.module.js';
import { pgError, PG_UNIQUE_VIOLATION } from '../database/pg-errors.js';

type CategoryRow = typeof categories.$inferSelect;

@Injectable()
export class CategoriesService {
	constructor(@Inject(DB) private readonly db: Database) {}

	async list(userId: string): Promise<Category[]> {
		const rows = await this.db
			.select()
			.from(categories)
			.where(eq(categories.userId, userId))
			.orderBy(asc(categories.kind), asc(categories.name));
		return rows.map(toDto);
	}

	async create(userId: string, input: CreateCategoryInput): Promise<Category> {
		if (input.parentId) {
			const [parent] = await this.db
				.select({ kind: categories.kind })
				.from(categories)
				.where(and(eq(categories.userId, userId), eq(categories.id, input.parentId)));
			if (!parent) throw AppError.notFound('Parent category');
			if (parent.kind !== input.kind) {
				throw AppError.validation('A subcategory must have the same kind as its parent');
			}
		}
		try {
			const [row] = await this.db
				.insert(categories)
				.values({ userId, ...input })
				.returning();
			return toDto(row!);
		} catch (error) {
			if (pgError(error)?.code === PG_UNIQUE_VIOLATION) {
				throw AppError.conflict('A category with this name already exists');
			}
			throw error;
		}
	}
}

function toDto(row: CategoryRow): Category {
	return {
		id: row.id,
		name: row.name,
		kind: row.kind,
		parentId: row.parentId,
		icon: row.icon,
		color: row.color,
		archivedAt: iso(row.archivedAt)
	};
}
