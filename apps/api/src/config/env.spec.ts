import { randomBytes } from 'node:crypto';
import { loadEnv } from './env.js';

const valid = {
	DATABASE_URL: 'postgres://u:p@localhost:5432/db',
	BETTER_AUTH_SECRET: 'x'.repeat(32),
	AI_KEYS_ENCRYPTION_KEY: randomBytes(32).toString('base64')
};

describe('loadEnv', () => {
	it('applies defaults and treats empty optional values as unset', () => {
		const env = loadEnv({ ...valid, TELEGRAM_BOT_TOKEN: '', INSTANCE_AI_PROVIDER: '', PORT: ' ' });
		expect(env).toMatchObject({
			PORT: 3000,
			AI_PROVIDER_MODE: 'real',
			APP_URL: 'http://localhost:5173'
		});
		expect(env.TELEGRAM_BOT_TOKEN).toBeUndefined();
	});

	it('lists every invalid variable', () => {
		expect(() => loadEnv({ AI_KEYS_ENCRYPTION_KEY: 'short' })).toThrow(
			/DATABASE_URL[\s\S]*BETTER_AUTH_SECRET[\s\S]*AI_KEYS_ENCRYPTION_KEY/
		);
	});
});

describe('AUTH_RATE_LIMIT', () => {
	it('is on by default and parses string booleans', () => {
		expect(loadEnv(valid).AUTH_RATE_LIMIT).toBe(true);
		expect(loadEnv({ ...valid, AUTH_RATE_LIMIT: 'false' }).AUTH_RATE_LIMIT).toBe(false);
	});
});
