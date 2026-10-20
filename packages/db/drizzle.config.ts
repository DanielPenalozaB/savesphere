import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	dialect: 'postgresql',
	schema: './src/schema/index.ts',
	out: './migrations',
	dbCredentials: {
		url: process.env.DATABASE_URL ?? 'postgres://savesphere:savesphere@localhost:5432/savesphere'
	},
	strict: true,
	verbose: true
});
