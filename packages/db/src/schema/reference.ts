import { sql } from 'drizzle-orm';
import {
	boolean,
	char,
	check,
	date,
	numeric,
	pgTable,
	primaryKey,
	smallint,
	text
} from 'drizzle-orm/pg-core';

export const currencies = pgTable(
	'currencies',
	{
		code: char('code', { length: 3 }).primaryKey(),
		name: text('name').notNull(),
		minorUnit: smallint('minor_unit').notNull()
	},
	(t) => [check('currencies_minor_unit_check', sql`${t.minorUnit} BETWEEN 0 AND 4`)]
);

export const exchangeRates = pgTable(
	'exchange_rates',
	{
		baseCurrency: char('base_currency', { length: 3 })
			.notNull()
			.references(() => currencies.code),
		quoteCurrency: char('quote_currency', { length: 3 })
			.notNull()
			.references(() => currencies.code),
		rateDate: date('rate_date').notNull(),
		rate: numeric('rate', { precision: 20, scale: 10 }).notNull()
	},
	(t) => [
		primaryKey({ columns: [t.baseCurrency, t.quoteCurrency, t.rateDate] }),
		check('exchange_rates_positive_check', sql`${t.rate} > 0`),
		check('exchange_rates_distinct_check', sql`${t.baseCurrency} <> ${t.quoteCurrency}`)
	]
);

export const aiProviders = pgTable('ai_providers', {
	code: text('code').primaryKey(),
	name: text('name').notNull(),
	isActive: boolean('is_active').notNull().default(true)
});
