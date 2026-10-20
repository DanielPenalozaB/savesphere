import { boolean, char, check, index, pgTable, smallint, text, uuid } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { createdAt, pk, timestamptz, updatedAt } from './_helpers.js';
import { currencies } from './reference.js';

// users / sessions / auth_accounts / verifications follow the Better Auth core schema.

export const users = pgTable('users', {
	id: pk(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	emailVerified: boolean('email_verified').notNull().default(false),
	image: text('image'),
	createdAt: createdAt(),
	updatedAt: updatedAt()
});

export const sessions = pgTable(
	'sessions',
	{
		id: pk(),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		token: text('token').notNull().unique(),
		expiresAt: timestamptz('expires_at').notNull(),
		ipAddress: text('ip_address'),
		userAgent: text('user_agent'),
		createdAt: createdAt(),
		updatedAt: updatedAt()
	},
	(t) => [index('sessions_user_idx').on(t.userId)]
);

/** OAuth / credential accounts (Better Auth "account" model), not financial accounts. */
export const authAccounts = pgTable(
	'auth_accounts',
	{
		id: pk(),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		accountId: text('account_id').notNull(),
		providerId: text('provider_id').notNull(),
		accessToken: text('access_token'),
		refreshToken: text('refresh_token'),
		idToken: text('id_token'),
		accessTokenExpiresAt: timestamptz('access_token_expires_at'),
		refreshTokenExpiresAt: timestamptz('refresh_token_expires_at'),
		scope: text('scope'),
		password: text('password'),
		createdAt: createdAt(),
		updatedAt: updatedAt()
	},
	(t) => [index('auth_accounts_user_idx').on(t.userId)]
);

export const verifications = pgTable(
	'verifications',
	{
		id: pk(),
		identifier: text('identifier').notNull(),
		value: text('value').notNull(),
		expiresAt: timestamptz('expires_at').notNull(),
		createdAt: createdAt(),
		updatedAt: updatedAt()
	},
	(t) => [index('verifications_identifier_idx').on(t.identifier)]
);

export const userSettings = pgTable(
	'user_settings',
	{
		userId: uuid('user_id')
			.primaryKey()
			.references(() => users.id, { onDelete: 'cascade' }),
		baseCurrency: char('base_currency', { length: 3 })
			.notNull()
			.references(() => currencies.code),
		timezone: text('timezone').notNull().default('UTC'),
		locale: text('locale').notNull().default('en-US'),
		weekStartsOn: smallint('week_starts_on').notNull().default(1),
		monthStartDay: smallint('month_start_day').notNull().default(1),
		/** User opt-out: AI stays off even when a key is configured. */
		aiEnabled: boolean('ai_enabled').notNull().default(true),
		onboardedAt: timestamptz('onboarded_at'),
		updatedAt: updatedAt()
	},
	(t) => [
		check('user_settings_week_start_check', sql`${t.weekStartsOn} BETWEEN 0 AND 6`),
		check('user_settings_month_start_check', sql`${t.monthStartDay} BETWEEN 1 AND 28`)
	]
);
