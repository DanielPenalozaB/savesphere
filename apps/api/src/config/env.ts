import { z } from 'zod';

const optional = z.string().trim().optional();

const envSchema = z.object({
	NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
	PORT: z.coerce.number().int().positive().default(3000),
	DATABASE_URL: z.url(),
	/** Public origin of the web app (same domain in production; the web app proxies /api). */
	APP_URL: z.url().default('http://localhost:5173'),
	BETTER_AUTH_SECRET: z.string().min(32),
	/** Brute-force protection on auth endpoints. Only disable for automated test stacks. */
	AUTH_RATE_LIMIT: z.stringbool().default(true),
	/** 32-byte base64 master key that encrypts user AI keys. Versioned for rotation. */
	AI_KEYS_ENCRYPTION_KEY: z
		.string()
		.refine((value) => Buffer.from(value, 'base64').length === 32, 'Must be 32 bytes, base64'),
	/** `fake` returns deterministic responses for tests and local development without a key. */
	AI_PROVIDER_MODE: z.enum(['real', 'fake']).default('real'),
	/** Optional instance-wide AI key used when a user has not configured their own. */
	INSTANCE_AI_PROVIDER: z.enum(['anthropic', 'openai', 'google']).optional(),
	INSTANCE_AI_KEY: optional,
	TELEGRAM_BOT_TOKEN: optional,
	WHATSAPP_ACCESS_TOKEN: optional,
	WHATSAPP_PHONE_NUMBER_ID: optional
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
	// `KEY=` in a .env file means "unset", so empty values fall back to defaults / undefined.
	const defined = Object.fromEntries(
		Object.entries(source).filter(([, value]) => value !== undefined && value.trim() !== '')
	);
	const result = envSchema.safeParse(defined);
	if (!result.success) {
		const issues = result.error.issues.map(
			(issue) => `  ${issue.path.join('.')}: ${issue.message}`
		);
		throw new Error(`Invalid environment configuration:\n${issues.join('\n')}`);
	}
	return result.data;
}

export const ENV = Symbol('ENV');
