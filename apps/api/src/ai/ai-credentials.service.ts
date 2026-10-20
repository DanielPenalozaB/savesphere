import { Inject, Injectable } from '@nestjs/common';
import type { AiCredential, AiProviderCode, SaveAiCredentialInput } from '@savesphere/contracts';
import { userAiCredentials, type Database } from '@savesphere/db';
import { and, desc, eq } from 'drizzle-orm';
import { AppError } from '../common/app-error.js';
import { iso } from '../common/iso.js';
import { DB } from '../database/database.module.js';
import { AiCapabilityService } from './ai-capability.service.js';
import { KeyEncryptionService } from './key-encryption.service.js';

type CredentialRow = typeof userAiCredentials.$inferSelect;

@Injectable()
export class AiCredentialsService {
	constructor(
		@Inject(DB) private readonly db: Database,
		private readonly encryption: KeyEncryptionService,
		private readonly capabilities: AiCapabilityService
	) {}

	async list(userId: string): Promise<AiCredential[]> {
		const rows = await this.db
			.select()
			.from(userAiCredentials)
			.where(eq(userAiCredentials.userId, userId))
			.orderBy(desc(userAiCredentials.isPrimary), desc(userAiCredentials.createdAt));
		return rows.map(toDto);
	}

	/** Validates the key with a real (or fake) provider call, then stores it encrypted. */
	async save(userId: string, input: SaveAiCredentialInput): Promise<AiCredential> {
		const valid = await this.capabilities
			.client({
				provider: input.provider,
				apiKey: input.apiKey,
				baseUrl: input.baseUrl,
				modelFast: input.modelFast,
				modelSmart: input.modelSmart
			})
			.validate();
		if (!valid) {
			throw AppError.validation('The provider rejected this API key');
		}

		const values = {
			...this.encryption.encrypt(input.apiKey),
			keyHint: input.apiKey.slice(-4),
			baseUrl: input.baseUrl ?? null,
			modelFast: input.modelFast ?? null,
			modelSmart: input.modelSmart ?? null,
			status: 'active' as const,
			lastValidatedAt: new Date()
		};

		const row = await this.db.transaction(async (tx) => {
			if (input.makePrimary) {
				await tx
					.update(userAiCredentials)
					.set({ isPrimary: false })
					.where(eq(userAiCredentials.userId, userId));
			}
			const [saved] = await tx
				.insert(userAiCredentials)
				.values({ userId, providerCode: input.provider, isPrimary: input.makePrimary, ...values })
				.onConflictDoUpdate({
					target: [userAiCredentials.userId, userAiCredentials.providerCode],
					set: { ...values, isPrimary: input.makePrimary }
				})
				.returning();
			return saved!;
		});
		return toDto(row);
	}

	async remove(userId: string, id: string): Promise<void> {
		const deleted = await this.db
			.delete(userAiCredentials)
			.where(and(eq(userAiCredentials.userId, userId), eq(userAiCredentials.id, id)))
			.returning({ id: userAiCredentials.id });
		if (deleted.length === 0) throw AppError.notFound('AI credential');
	}
}

function toDto(row: CredentialRow): AiCredential {
	return {
		id: row.id,
		provider: row.providerCode as AiProviderCode,
		keyHint: `••••${row.keyHint}`,
		baseUrl: row.baseUrl,
		modelFast: row.modelFast,
		modelSmart: row.modelSmart,
		isPrimary: row.isPrimary,
		status: row.status,
		lastValidatedAt: iso(row.lastValidatedAt),
		createdAt: row.createdAt.toISOString()
	};
}
