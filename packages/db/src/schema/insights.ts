import { sql } from 'drizzle-orm';
import {
	check,
	date,
	foreignKey,
	index,
	jsonb,
	pgTable,
	text,
	unique,
	uuid
} from 'drizzle-orm/pg-core';
import { createdAt, pk, timestamptz } from './_helpers.js';
import { users } from './auth.js';
import { generatedBy, insightKind, periodKind, severityKind } from './enums.js';
import { categories } from './ledger.js';

export const insights = pgTable(
	'insights',
	{
		id: pk(),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		kind: insightKind('kind').notNull(),
		severity: severityKind('severity').notNull().default('info'),
		generatedBy: generatedBy('generated_by').notNull(),
		title: text('title').notNull(),
		body: text('body').notNull(),
		relatedCategoryId: uuid('related_category_id'),
		periodStart: date('period_start'),
		periodEnd: date('period_end'),
		evidence: jsonb('evidence').notNull().default({}),
		dismissedAt: timestamptz('dismissed_at'),
		actedAt: timestamptz('acted_at'),
		createdAt: createdAt()
	},
	(t) => [
		foreignKey({
			name: 'insights_category_fk',
			columns: [t.userId, t.relatedCategoryId],
			foreignColumns: [categories.userId, categories.id]
		}),
		index('insights_feed_idx')
			.on(t.userId, t.createdAt.desc())
			.where(sql`${t.dismissedAt} IS NULL`)
	]
);

export const reports = pgTable(
	'reports',
	{
		id: pk(),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		period: periodKind('period').notNull(),
		periodStart: date('period_start').notNull(),
		periodEnd: date('period_end').notNull(),
		/** Frozen snapshot: reports must not change when underlying data changes. */
		metrics: jsonb('metrics').notNull(),
		/** Only present when AI was available. */
		narrative: text('narrative'),
		generatedAt: timestamptz('generated_at').notNull().defaultNow()
	},
	(t) => [
		unique('reports_user_period_key').on(t.userId, t.period, t.periodStart),
		check('reports_dates_check', sql`${t.periodEnd} >= ${t.periodStart}`)
	]
);
