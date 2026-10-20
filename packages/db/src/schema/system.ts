import { sql } from 'drizzle-orm';
import { index, jsonb, pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { createdAt, pk, timestamptz } from './_helpers.js';

/** Transactional outbox: written in the same DB transaction as the change it describes. */
export const outboxEvents = pgTable(
	'outbox_events',
	{
		id: pk(),
		aggregateType: text('aggregate_type').notNull(),
		aggregateId: uuid('aggregate_id').notNull(),
		eventType: text('event_type').notNull(),
		payload: jsonb('payload').notNull(),
		createdAt: createdAt(),
		processedAt: timestamptz('processed_at')
	},
	(t) => [
		index('outbox_events_pending_idx')
			.on(t.createdAt)
			.where(sql`${t.processedAt} IS NULL`)
	]
);
