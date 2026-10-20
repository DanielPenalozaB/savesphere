import { z } from 'zod';
import { id, isoDateTime } from './common.js';

export const categoryKind = z.enum(['expense', 'income']);
export type CategoryKind = z.infer<typeof categoryKind>;

export const createCategorySchema = z.object({
	name: z.string().trim().min(1).max(60),
	kind: categoryKind,
	parentId: id.optional(),
	icon: z.string().max(40).optional(),
	color: z
		.string()
		.regex(/^#[0-9a-fA-F]{6}$/)
		.optional()
});
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

export const categorySchema = z.object({
	id,
	name: z.string(),
	kind: categoryKind,
	parentId: id.nullable(),
	icon: z.string().nullable(),
	color: z.string().nullable(),
	archivedAt: isoDateTime.nullable()
});
export type Category = z.infer<typeof categorySchema>;
