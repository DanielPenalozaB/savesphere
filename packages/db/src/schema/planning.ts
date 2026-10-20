import { sql } from 'drizzle-orm';
import {
	boolean,
	char,
	check,
	date,
	foreignKey,
	index,
	jsonb,
	pgTable,
	primaryKey,
	smallint,
	text,
	unique,
	uuid
} from 'drizzle-orm/pg-core';
import { createdAt, minor, pk, timestamptz } from './_helpers.js';
import { users } from './auth.js';
import { generatedBy, goalStatus, periodKind, verdictKind } from './enums.js';
import { accounts, categories, transactions } from './ledger.js';
import { currencies } from './reference.js';

const userId = () =>
	uuid('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' });

export const budgets = pgTable(
	'budgets',
	{
		id: pk(),
		userId: userId(),
		name: text('name').notNull(),
		period: periodKind('period').notNull(),
		currency: char('currency', { length: 3 })
			.notNull()
			.references(() => currencies.code),
		startsOn: date('starts_on').notNull(),
		endsOn: date('ends_on'),
		createdAt: createdAt()
	},
	(t) => [
		unique('budgets_user_id_id_key').on(t.userId, t.id),
		check('budgets_dates_check', sql`${t.endsOn} IS NULL OR ${t.endsOn} >= ${t.startsOn}`)
	]
);

export const budgetLimits = pgTable(
	'budget_limits',
	{
		userId: uuid('user_id').notNull(),
		budgetId: uuid('budget_id').notNull(),
		categoryId: uuid('category_id').notNull(),
		limitMinor: minor('limit_minor').notNull(),
		alertThresholdPct: smallint('alert_threshold_pct').notNull().default(80),
		rollover: boolean('rollover').notNull().default(false)
	},
	(t) => [
		primaryKey({ columns: [t.budgetId, t.categoryId] }),
		foreignKey({
			name: 'budget_limits_budget_fk',
			columns: [t.userId, t.budgetId],
			foreignColumns: [budgets.userId, budgets.id]
		}).onDelete('cascade'),
		foreignKey({
			name: 'budget_limits_category_fk',
			columns: [t.userId, t.categoryId],
			foreignColumns: [categories.userId, categories.id]
		}),
		check('budget_limits_amount_check', sql`${t.limitMinor} > 0`),
		check('budget_limits_threshold_check', sql`${t.alertThresholdPct} BETWEEN 1 AND 100`),
		index('budget_limits_category_idx').on(t.categoryId)
	]
);

export const goals = pgTable(
	'goals',
	{
		id: pk(),
		userId: userId(),
		name: text('name').notNull(),
		targetMinor: minor('target_minor').notNull(),
		currency: char('currency', { length: 3 })
			.notNull()
			.references(() => currencies.code),
		targetDate: date('target_date'),
		/** Optional savings account backing the goal. */
		accountId: uuid('account_id'),
		priority: smallint('priority').notNull().default(0),
		status: goalStatus('status').notNull().default('active'),
		icon: text('icon'),
		achievedAt: timestamptz('achieved_at'),
		createdAt: createdAt()
	},
	(t) => [
		unique('goals_user_id_id_key').on(t.userId, t.id),
		foreignKey({
			name: 'goals_account_fk',
			columns: [t.userId, t.accountId],
			foreignColumns: [accounts.userId, accounts.id]
		}),
		check('goals_target_check', sql`${t.targetMinor} > 0`)
	]
);

/** Goal progress is the sum of its allocations (never stored on the goal). */
export const goalAllocations = pgTable(
	'goal_allocations',
	{
		id: pk(),
		userId: uuid('user_id').notNull(),
		goalId: uuid('goal_id').notNull(),
		/** The saving transfer that funded this allocation, if any. */
		transactionId: uuid('transaction_id'),
		/** Negative = withdrawal from the goal. */
		amountMinor: minor('amount_minor').notNull(),
		allocatedOn: date('allocated_on').notNull(),
		note: text('note'),
		createdAt: createdAt()
	},
	(t) => [
		foreignKey({
			name: 'goal_allocations_goal_fk',
			columns: [t.userId, t.goalId],
			foreignColumns: [goals.userId, goals.id]
		}).onDelete('cascade'),
		foreignKey({
			name: 'goal_allocations_transaction_fk',
			columns: [t.userId, t.transactionId],
			foreignColumns: [transactions.userId, transactions.id]
		}),
		check('goal_allocations_non_zero_check', sql`${t.amountMinor} <> 0`),
		index('goal_allocations_goal_idx').on(t.goalId)
	]
);

/** "Can I afford it?" history. Inputs are frozen in metrics_snapshot on purpose. */
export const purchaseEvaluations = pgTable(
	'purchase_evaluations',
	{
		id: pk(),
		userId: userId(),
		itemName: text('item_name').notNull(),
		priceMinor: minor('price_minor').notNull(),
		currency: char('currency', { length: 3 })
			.notNull()
			.references(() => currencies.code),
		verdict: verdictKind('verdict').notNull(),
		recommendedOn: date('recommended_on'),
		metricsSnapshot: jsonb('metrics_snapshot').notNull(),
		/** Only present when AI was available. */
		explanation: text('explanation'),
		evaluatedBy: generatedBy('evaluated_by').notNull(),
		createdAt: createdAt()
	},
	(t) => [
		check('purchase_evaluations_price_check', sql`${t.priceMinor} > 0`),
		index('purchase_evaluations_user_idx').on(t.userId, t.createdAt.desc())
	]
);
