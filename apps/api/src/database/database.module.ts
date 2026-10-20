import { Global, Inject, Module, type OnApplicationShutdown } from '@nestjs/common';
import { createDb, type Database, type DbHandle } from '@savesphere/db';
import { ENV, type Env } from '../config/env.js';

export const DB_HANDLE = Symbol('DB_HANDLE');
export const DB = Symbol('DB');

@Global()
@Module({
	providers: [
		{
			provide: DB_HANDLE,
			inject: [ENV],
			useFactory: (env: Env): DbHandle => createDb(env.DATABASE_URL)
		},
		{
			provide: DB,
			inject: [DB_HANDLE],
			useFactory: (handle: DbHandle): Database => handle.db
		}
	],
	exports: [DB]
})
export class DatabaseModule implements OnApplicationShutdown {
	constructor(@Inject(DB_HANDLE) private readonly handle: DbHandle) {}

	async onApplicationShutdown(): Promise<void> {
		await this.handle.close();
	}
}
