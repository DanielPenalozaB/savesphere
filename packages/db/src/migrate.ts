import { fileURLToPath } from 'node:url';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { createDb } from './client.js';

export const migrationsFolder = fileURLToPath(new URL('../migrations', import.meta.url));

export async function runMigrations(connectionString: string): Promise<void> {
	const { db, close } = createDb(connectionString, { max: 1 });
	try {
		await migrate(db, { migrationsFolder });
	} finally {
		await close();
	}
}
