import { sql } from 'drizzle-orm';
import {
	boolean,
	check,
	index,
	jsonb,
	pgTable,
	primaryKey,
	text,
	unique,
	uuid
} from 'drizzle-orm/pg-core';
import { createdAt, pk, timestamptz } from './_helpers.js';
import { users } from './auth.js';
import { channelKind, deliveryStatus, notificationType } from './enums.js';

const userId = () =>
	uuid('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' });

/** Links a user to an external chat identity (WhatsApp phone, Telegram chat id). */
export const channelIdentities = pgTable(
	'channel_identities',
	{
		id: pk(),
		userId: userId(),
		channel: channelKind('channel').notNull(),
		externalId: text('external_id').notNull(),
		verifiedAt: timestamptz('verified_at'),
		createdAt: createdAt()
	},
	(t) => [
		unique('channel_identities_external_key').on(t.channel, t.externalId),
		unique('channel_identities_user_channel_key').on(t.userId, t.channel),
		check('channel_identities_chat_check', sql`${t.channel} IN ('whatsapp', 'telegram')`)
	]
);

export const pushSubscriptions = pgTable(
	'push_subscriptions',
	{
		id: pk(),
		userId: userId(),
		endpoint: text('endpoint').notNull().unique(),
		p256dh: text('p256dh').notNull(),
		auth: text('auth').notNull(),
		userAgent: text('user_agent'),
		createdAt: createdAt(),
		lastUsedAt: timestamptz('last_used_at')
	},
	(t) => [index('push_subscriptions_user_idx').on(t.userId)]
);

export const notificationPreferences = pgTable(
	'notification_preferences',
	{
		userId: userId(),
		type: notificationType('type').notNull(),
		channel: channelKind('channel').notNull(),
		enabled: boolean('enabled').notNull().default(true)
	},
	(t) => [primaryKey({ columns: [t.userId, t.type, t.channel] })]
);

/** One row per delivery attempt on a channel. */
export const notifications = pgTable(
	'notifications',
	{
		id: pk(),
		userId: userId(),
		type: notificationType('type').notNull(),
		channel: channelKind('channel').notNull(),
		title: text('title').notNull(),
		body: text('body').notNull(),
		payload: jsonb('payload').notNull().default({}),
		status: deliveryStatus('status').notNull().default('pending'),
		error: text('error'),
		sentAt: timestamptz('sent_at'),
		readAt: timestamptz('read_at'),
		createdAt: createdAt()
	},
	(t) => [index('notifications_user_idx').on(t.userId, t.createdAt.desc())]
);
