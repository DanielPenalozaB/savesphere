import { execFileSync } from 'node:child_process';
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { createDb, runMigrations } from '@savesphere/db';
import { seedReferenceData } from '@savesphere/db/seed';
import type { TestProject } from 'vitest/node';

declare module 'vitest' {
	export interface ProvidedContext {
		databaseUrl: string;
	}
}

let container: StartedPostgreSqlContainer | undefined;

/**
 * Testcontainers only probes default socket paths. Resolve the active Docker context so
 * Rancher Desktop, Colima and OrbStack work without extra environment variables.
 */
function useActiveDockerContext(): void {
	if (process.env.DOCKER_HOST) return;
	try {
		const host = execFileSync(
			'docker',
			['context', 'inspect', '--format', '{{.Endpoints.docker.Host}}'],
			{
				encoding: 'utf8'
			}
		).trim();
		if (host && host !== 'unix:///var/run/docker.sock') {
			process.env.DOCKER_HOST = host;
			// Inside those VMs the daemon socket lives at the default path (needed by Ryuk).
			process.env.TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE ??= '/var/run/docker.sock';
		}
	} catch {
		// No docker CLI: let Testcontainers report a clear error.
	}
}

/**
 * One throwaway Postgres 18 per test run, migrated and seeded exactly like production.
 * Set TEST_DATABASE_URL to reuse an existing database instead (e.g. a CI service container).
 */
export async function setup(project: TestProject): Promise<void> {
	let url = process.env.TEST_DATABASE_URL;
	if (!url) {
		useActiveDockerContext();
		container = await new PostgreSqlContainer('postgres:18-alpine').start();
		url = container.getConnectionUri();
	}
	await runMigrations(url);
	const { db, close } = createDb(url, { max: 1 });
	await seedReferenceData(db);
	await close();
	project.provide('databaseUrl', url);
}

export async function teardown(): Promise<void> {
	await container?.stop();
}
