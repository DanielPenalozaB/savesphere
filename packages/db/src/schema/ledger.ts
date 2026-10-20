import { sql } from 'drizzle-orm';
import {
	boolean,
	char,
	check,
	date,
	foreignKey,
	index,
	integer,
	pgTable,
	primaryKey,
	text,
	unique,
	uuid
} from 'drizzle-orm/pg-core';
import { createdAt, minor, pk, timestamptz, updatedAt } from './_helpers.js';
import { users } from './auth.js';
import {
	accountKind,
	categoryKind,
	subscriptionStatus,
	transactionKind,
	transactionSource
} from './enums.js';
import { currencies } from './reference.js';

// Tenant safety: child rows reference parents through (user_id, id) composite keys, so the
// database itself rejects links between rows that belong to different users.

const userId = () =>
	uuid('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' });

export const accounts = pgTable(
	'accounts',
	{
		id: pk(),
		userId: userId(),
		name: text('name').notNull(),
		kind: accountKind('kind').notNull(),
		currency: char('currency', { length: 3 })
			.notNull()
			.references(() => currencies.code),
		includeInTotals: boolean('include_in_totals').notNull().default(true),
		archivedAt: timestamptz('archived_at'),
		createdAt: createdAt(),
		updatedAt: updatedAt()
	},
	(t) => [
		unique('accounts_user_id_id_key').on(t.userId, t.id),
		unique('accounts_user_name_key').on(t.userId, t.name)
	]
);

export const categories = pgTable(
	'categories',
	{
		id: pk(),
		userId: userId(),
		parentId: uuid('parent_id'),
		kind: categoryKind('kind').notNull(),
		name: text('name').notNull(),
		icon: text('icon'),
		color: text('color'),
		archivedAt: timestamptz('archived_at'),
		createdAt: createdAt()
	},
	(t) => [
		unique('categories_user_id_id_key').on(t.userId, t.id),
		unique('categories_user_parent_name_key').on(t.userId, t.parentId, t.name).nullsNotDistinct(),
		foreignKey({
			name: 'categories_parent_fk',
			columns: [t.userId, t.parentId],
			foreignColumns: [t.userId, t.id]
		})
	]
);

export const merchants = pgTable(
	'merchants',
	{
		id: pk(),
		userId: userId(),
		name: text('name').notNull(),
		/** Powers rule-based auto-categorization when AI is not available. */
		defaultCategoryId: uuid('default_category_id'),
		createdAt: createdAt()
	},
	(t) => [
		unique('merchants_user_id_id_key').on(t.userId, t.id),
		unique('merchants_user_name_key').on(t.userId, t.name),
		foreignKey({
			name: 'merchants_default_category_fk',
			columns: [t.userId, t.defaultCategoryId],
			foreignColumns: [categories.userId, categories.id]
		})
	]
);

export const tags = pgTable(
	'tags',
	{
		id: pk(),
		userId: userId(),
		name: text('name').notNull()
	},
	(t) => [
		unique('tags_user_id_id_key').on(t.userId, t.id),
		unique('tags_user_name_key').on(t.userId, t.name)
	]
);

export const recurringRules = pgTable(
	'recurring_rules',
	{
		id: pk(),
		userId: userId(),
		kind: transactionKind('kind').notNull(),
		accountId: uuid('account_id').notNull(),
		/** Destination account, transfers only. */
		counterAccountId: uuid('counter_account_id'),
		categoryId: uuid('category_id'),
		amountMinor: minor('amount_minor').notNull(),
		description: text('description').notNull(),
		/** RFC 5545 recurrence rule, e.g. FREQ=MONTHLY;BYMONTHDAY=5 */
		rrule: text('rrule').notNull(),
		startsOn: date('starts_on').notNull(),
		endsOn: date('ends_on'),
		/** Scheduling cache derived from rrule (deliberate denormalization). */
		nextRunOn: date('next_run_on'),
		/** false = remind only, do not create the transaction automatically. */
		autoPost: boolean('auto_post').notNull().default(true),
		pausedAt: timestamptz('paused_at'),
		createdAt: createdAt(),
		updatedAt: updatedAt()
	},
	(t) => [
		unique('recurring_rules_user_id_id_key').on(t.userId, t.id),
		foreignKey({
			name: 'recurring_rules_account_fk',
			columns: [t.userId, t.accountId],
			foreignColumns: [accounts.userId, accounts.id]
		}),
		foreignKey({
			name: 'recurring_rules_counter_account_fk',
			columns: [t.userId, t.counterAccountId],
			foreignColumns: [accounts.userId, accounts.id]
		}),
		foreignKey({
			name: 'recurring_rules_category_fk',
			columns: [t.userId, t.categoryId],
			foreignColumns: [categories.userId, categories.id]
		}),
		check('recurring_rules_kind_check', sql`${t.kind} <> 'adjustment'`),
		check('recurring_rules_amount_check', sql`${t.amountMinor} > 0`),
		check(
			'recurring_rules_transfer_shape_check',
			sql`(${t.kind} = 'transfer') = (${t.counterAccountId} IS NOT NULL) AND (${t.kind} = 'transfer') = (${t.categoryId} IS NULL)`
		),
		check('recurring_rules_dates_check', sql`${t.endsOn} IS NULL OR ${t.endsOn} >= ${t.startsOn}`),
		index('recurring_rules_due_idx')
			.on(t.nextRunOn)
			.where(sql`${t.pausedAt} IS NULL`)
	]
);

export const subscriptions = pgTable(
	'subscriptions',
	{
		id: pk(),
		userId: userId(),
		/** Amount and cadence live in the recurring rule (no duplication). */
		recurringRuleId: uuid('recurring_rule_id').notNull().unique(),
		serviceName: text('service_name').notNull(),
		websiteUrl: text('website_url'),
		status: subscriptionStatus('status').notNull().default('active'),
		trialEndsOn: date('trial_ends_on'),
		cancelledOn: date('cancelled_on'),
		/** Used for "unused subscription" detection. */
		lastUsedOn: date('last_used_on'),
		createdAt: createdAt()
	},
	(t) => [
		foreignKey({
			name: 'subscriptions_recurring_rule_fk',
			columns: [t.userId, t.recurringRuleId],
			foreignColumns: [recurringRules.userId, recurringRules.id]
		}).onDelete('cascade')
	]
);

export const transactions = pgTable(
	'transactions',
	{
		id: pk(),
		userId: userId(),
		kind: transactionKind('kind').notNull(),
		categoryId: uuid('category_id'),
		merchantId: uuid('merchant_id'),
		recurringRuleId: uuid('recurring_rule_id'),
		occurredAt: timestamptz('occurred_at').notNull(),
		description: text('description'),
		note: text('note'),
		source: transactionSource('source').notNull().default('app'),
		/** Client-generated idempotency key for offline sync. */
		clientRef: uuid('client_ref'),
		createdAt: createdAt(),
		updatedAt: updatedAt(),
		/** Soft delete: needed for offline sync and undo. */
		deletedAt: timestamptz('deleted_at')
	},
	(t) => [
		unique('transactions_user_id_id_key').on(t.userId, t.id),
		unique('transactions_user_client_ref_key').on(t.userId, t.clientRef),
		foreignKey({
			name: 'transactions_category_fk',
			columns: [t.userId, t.categoryId],
			foreignColumns: [categories.userId, categories.id]
		}),
		foreignKey({
			name: 'transactions_merchant_fk',
			columns: [t.userId, t.merchantId],
			foreignColumns: [merchants.userId, merchants.id]
		}),
		foreignKey({
			name: 'transactions_recurring_rule_fk',
			columns: [t.userId, t.recurringRuleId],
			foreignColumns: [recurringRules.userId, recurringRules.id]
		}),
		check(
			'transactions_category_required_check',
			sql`${t.kind} NOT IN ('expense', 'income') OR ${t.categoryId} IS NOT NULL`
		),
		check(
			'transactions_transfer_no_category_check',
			sql`${t.kind} <> 'transfer' OR ${t.categoryId} IS NULL`
		),
		index('transactions_user_date_idx')
			.on(t.userId, t.occurredAt.desc(), t.id.desc())
			.where(sql`${t.deletedAt} IS NULL`),
		index('transactions_user_category_idx')
			.on(t.userId, t.categoryId, t.occurredAt)
			.where(sql`${t.deletedAt} IS NULL`)
	]
);

export const transactionEntries = pgTable(
	'transaction_entries',
	{
		id: pk(),
		userId: uuid('user_id').notNull(),
		transactionId: uuid('transaction_id').notNull(),
		accountId: uuid('account_id').notNull(),
		/** Signed amount in the account's currency: positive = inflow, negative = outflow. */
		amountMinor: minor('amount_minor').notNull()
	},
	(t) => [
		unique('transaction_entries_tx_account_key').on(t.transactionId, t.accountId),
		foreignKey({
			name: 'transaction_entries_transaction_fk',
			columns: [t.userId, t.transactionId],
			foreignColumns: [transactions.userId, transactions.id]
		}).onDelete('cascade'),
		foreignKey({
			name: 'transaction_entries_account_fk',
			columns: [t.userId, t.accountId],
			foreignColumns: [accounts.userId, accounts.id]
		}),
		check('transaction_entries_non_zero_check', sql`${t.amountMinor} <> 0`),
		index('transaction_entries_account_idx').on(t.accountId)
	]
);

export const transactionTags = pgTable(
	'transaction_tags',
	{
		userId: uuid('user_id').notNull(),
		transactionId: uuid('transaction_id').notNull(),
		tagId: uuid('tag_id').notNull()
	},
	(t) => [
		primaryKey({ columns: [t.transactionId, t.tagId] }),
		foreignKey({
			name: 'transaction_tags_transaction_fk',
			columns: [t.userId, t.transactionId],
			foreignColumns: [transactions.userId, transactions.id]
		}).onDelete('cascade'),
		foreignKey({
			name: 'transaction_tags_tag_fk',
			columns: [t.userId, t.tagId],
			foreignColumns: [tags.userId, tags.id]
		}).onDelete('cascade'),
		index('transaction_tags_tag_idx').on(t.tagId)
	]
);

export const attachments = pgTable(
	'attachments',
	{
		id: pk(),
		userId: uuid('user_id').notNull(),
		transactionId: uuid('transaction_id').notNull(),
		/** Object key in S3-compatible storage. */
		storageKey: text('storage_key').notNull().unique(),
		mimeType: text('mime_type').notNull(),
		sizeBytes: integer('size_bytes').notNull(),
		createdAt: createdAt()
	},
	(t) => [
		foreignKey({
			name: 'attachments_transaction_fk',
			columns: [t.userId, t.transactionId],
			foreignColumns: [transactions.userId, transactions.id]
		}).onDelete('cascade'),
		check('attachments_size_check', sql`${t.sizeBytes} > 0`),
		index('attachments_transaction_idx').on(t.transactionId)
	]
);
