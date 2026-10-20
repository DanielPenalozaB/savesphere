import { pgEnum } from 'drizzle-orm/pg-core';

export const accountKind = pgEnum('account_kind', [
	'cash',
	'checking',
	'savings',
	'credit_card',
	'investment',
	'loan',
	'other'
]);
export const categoryKind = pgEnum('category_kind', ['expense', 'income']);
export const transactionKind = pgEnum('transaction_kind', [
	'expense',
	'income',
	'transfer',
	'adjustment'
]);
export const transactionSource = pgEnum('transaction_source', [
	'app',
	'whatsapp',
	'telegram',
	'import',
	'recurring',
	'api'
]);
export const subscriptionStatus = pgEnum('subscription_status', [
	'trial',
	'active',
	'paused',
	'cancelled'
]);
export const periodKind = pgEnum('period_kind', ['weekly', 'monthly', 'quarterly', 'yearly']);
export const goalStatus = pgEnum('goal_status', ['active', 'achieved', 'paused', 'abandoned']);
export const verdictKind = pgEnum('verdict_kind', ['affordable', 'wait', 'not_recommended']);
export const generatedBy = pgEnum('generated_by', ['rules', 'ai']);
export const insightKind = pgEnum('insight_kind', [
	'overspending',
	'money_leak',
	'unusual_spend',
	'unused_subscription',
	'habit_tip',
	'goal_risk'
]);
export const severityKind = pgEnum('severity_kind', ['info', 'warning', 'critical']);
export const channelKind = pgEnum('channel_kind', ['push', 'email', 'whatsapp', 'telegram']);
export const notificationType = pgEnum('notification_type', [
	'budget_alert',
	'bill_reminder',
	'insight',
	'goal_update',
	'weekly_report',
	'monthly_report',
	'quarterly_report',
	'yearly_report'
]);
export const deliveryStatus = pgEnum('delivery_status', ['pending', 'sent', 'failed', 'read']);
export const credentialStatus = pgEnum('credential_status', ['active', 'invalid', 'revoked']);
