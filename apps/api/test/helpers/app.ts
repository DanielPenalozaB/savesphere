import { randomBytes, randomUUID } from 'node:crypto';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { createDb, type DbHandle } from '@savesphere/db';
import request from 'supertest';
import { inject } from 'vitest';
import { AppModule } from '../../src/app.module.js';
import { configureApp } from '../../src/configure-app.js';
import { loadEnv, type Env } from '../../src/config/env.js';

export const APP_ORIGIN = 'http://localhost:5173';

export interface TestApp {
	app: INestApplication;
	env: Env;
	/** Direct DB access for assertions and DB-level constraint tests. */
	db: DbHandle;
	close: () => Promise<void>;
}

export async function createTestApp(
	overrides: Partial<Record<keyof Env, string>> = {}
): Promise<TestApp> {
	const env = loadEnv({
		NODE_ENV: 'test',
		DATABASE_URL: inject('databaseUrl'),
		APP_URL: APP_ORIGIN,
		BETTER_AUTH_SECRET: randomBytes(32).toString('hex'),
		AI_KEYS_ENCRYPTION_KEY: randomBytes(32).toString('base64'),
		AI_PROVIDER_MODE: 'fake',
		AUTH_RATE_LIMIT: 'false',
		...overrides
	});
	const moduleRef = await Test.createTestingModule({ imports: [AppModule.forRoot(env)] }).compile();
	const app = configureApp(moduleRef.createNestApplication({ bodyParser: false, logger: false }));
	// Listen once on an ephemeral port: supertest would otherwise open/close a server per request.
	await app.listen(0, '127.0.0.1');
	const db = createDb(env.DATABASE_URL, { max: 2 });
	return {
		app,
		env,
		db,
		close: async () => {
			await db.close();
			await app.close();
		}
	};
}

export type Agent = ReturnType<typeof request.agent>;

/** Signs up a brand-new user and returns a cookie-carrying agent. Each test gets isolated data. */
export async function signUp(
	app: INestApplication
): Promise<{ agent: Agent; userId: string; email: string }> {
	const agent = request.agent(app.getHttpServer()).set('Origin', APP_ORIGIN);
	const email = `user-${randomUUID()}@test.savesphere.app`;
	const response = await agent
		.post('/api/auth/sign-up/email')
		.send({ email, password: 'correct-horse-battery', name: 'Test User' })
		.expect(200);
	return { agent, userId: response.body.user.id as string, email };
}
