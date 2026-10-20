import { authAccounts, sessions, users, verifications, type Database } from '@savesphere/db';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import type { Env } from '../config/env.js';
import { provisionUser } from './provision-user.js';

export function createAuth(db: Database, env: Env) {
	return betterAuth({
		// The web app proxies /api/* on the same origin, so the public base URL is the web origin.
		baseURL: env.APP_URL,
		basePath: '/api/auth',
		secret: env.BETTER_AUTH_SECRET,
		trustedOrigins: [env.APP_URL],
		database: drizzleAdapter(db, {
			provider: 'pg',
			schema: { user: users, session: sessions, account: authAccounts, verification: verifications }
		}),
		emailAndPassword: { enabled: true, minPasswordLength: 8 },
		rateLimit: { enabled: env.AUTH_RATE_LIMIT },
		advanced: {
			// The API is only reachable through the web proxy, which sets the real client address.
			ipAddress: { ipAddressHeaders: ['x-forwarded-for'] },
			// Let Postgres generate UUIDv7 ids.
			database: { generateId: false }
		},
		databaseHooks: {
			user: {
				create: {
					after: async (user) => provisionUser(db, user.id)
				}
			}
		},
		telemetry: { enabled: false }
	});
}

export type Auth = ReturnType<typeof createAuth>;
export const AUTH = Symbol('AUTH');
