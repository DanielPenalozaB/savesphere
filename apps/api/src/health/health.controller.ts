import { Controller, Get, Inject } from '@nestjs/common';
import type { Database } from '@savesphere/db';
import { sql } from 'drizzle-orm';
import { Public } from '../auth/auth.decorators.js';
import { DB } from '../database/database.module.js';

@Controller('health')
export class HealthController {
	constructor(@Inject(DB) private readonly db: Database) {}

	@Get()
	@Public()
	async check(): Promise<{ status: 'ok' }> {
		await this.db.execute(sql`select 1`);
		return { status: 'ok' };
	}
}
