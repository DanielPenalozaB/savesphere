import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import type { Database } from '@savesphere/db';
import { ENV, type Env } from '../config/env.js';
import { DB } from '../database/database.module.js';
import { AUTH, createAuth } from './auth.factory.js';
import { AuthGuard } from './auth.guard.js';

@Global()
@Module({
	providers: [
		{
			provide: AUTH,
			inject: [DB, ENV],
			useFactory: (db: Database, env: Env) => createAuth(db, env)
		},
		{ provide: APP_GUARD, useClass: AuthGuard }
	],
	exports: [AUTH]
})
export class AuthModule {}
