import { sql } from 'drizzle-orm';
import {
	boolean,
	check,
	customType,
	foreignKey,
	index,
	integer,
	pgTable,
	smallint,
	text,
	unique,
	uniqueIndex,
	uuid
} from 'drizzle-orm/pg-core';
import { createdAt, pk, timestamptz } from './_helpers.js';
import { users } from './auth.js';
import { credentialStatus } from './enums.js';
import { aiProviders } from './reference.js';

const bytea = customType<{ data: Buffer; driverData: Buffer }>({
	dataType: () => 'bytea'
});

/** Bring-your-own-key AI credentials, encrypted with AES-256-GCM. Keys are never returned. */
export const userAiCredentials = pgTable(
	'user_ai_credentials',
	{
		id: pk(),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		providerCode: text('provider_code')
			.notNull()
			.references(() => aiProviders.code),
		ciphertext: bytea('ciphertext').notNull(),
		iv: bytea('iv').notNull(),
		authTag: bytea('auth_tag').notNull(),
		/** Version of the master key used, enabling key rotation. */
		keyVersion: smallint('key_version').notNull(),
		keyHint: text('key_hint').notNull(),
		baseUrl: text('base_url'),
		modelFast: text('model_fast'),
		modelSmart: text('model_smart'),
		isPrimary: boolean('is_primary').notNull().default(false),
		status: credentialStatus('status').notNull().default('active'),
		lastValidatedAt: timestamptz('last_validated_at'),
		createdAt: createdAt()
	},
	(t) => [
		unique('user_ai_credentials_user_id_id_key').on(t.userId, t.id),
		unique('user_ai_credentials_user_provider_key').on(t.userId, t.providerCode),
		uniqueIndex('user_ai_credentials_one_primary_idx')
			.on(t.userId)
			.where(sql`${t.isPrimary}`)
	]
);

export const aiUsage = pgTable(
	'ai_usage',
	{
		id: pk(),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		/** NULL when the instance-level key was used. */
		credentialId: uuid('credential_id'),
		feature: text('feature').notNull(),
		model: text('model').notNull(),
		inputTokens: integer('input_tokens').notNull(),
		outputTokens: integer('output_tokens').notNull(),
		createdAt: createdAt()
	},
	(t) => [
		foreignKey({
			name: 'ai_usage_credential_fk',
			columns: [t.userId, t.credentialId],
			foreignColumns: [userAiCredentials.userId, userAiCredentials.id]
		}),
		check('ai_usage_tokens_check', sql`${t.inputTokens} >= 0 AND ${t.outputTokens} >= 0`),
		index('ai_usage_user_idx').on(t.userId, t.createdAt.desc())
	]
);
