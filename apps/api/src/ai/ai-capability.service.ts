import { Inject, Injectable } from '@nestjs/common';
import type { AiProviderCode, Capabilities } from '@savesphere/contracts';
import { userAiCredentials, userSettings, type Database } from '@savesphere/db';
import { and, desc, eq, ne } from 'drizzle-orm';
import { ENV, type Env } from '../config/env.js';
import { DB } from '../database/database.module.js';
import type { AiClient, AiProviderConfig } from './ai-client.js';
import { FakeAiClient } from './fake-ai.client.js';
import { KeyEncryptionService } from './key-encryption.service.js';
import { SdkAiClient } from './sdk-ai.client.js';

export type AiResolution =
	| {
			available: true;
			source: 'user' | 'instance';
			credentialId: string | null;
			config: AiProviderConfig;
	  }
	| { available: false; reason: NonNullable<Capabilities['ai']['reason']> };

/**
 * Decides whether AI is usable for a user:
 * user opt-out → user's primary key → instance key → unavailable.
 */
@Injectable()
export class AiCapabilityService {
	constructor(
		@Inject(DB) private readonly db: Database,
		@Inject(ENV) private readonly env: Env,
		private readonly encryption: KeyEncryptionService
	) {}

	async resolve(userId: string): Promise<AiResolution> {
		const [settings] = await this.db
			.select({ aiEnabled: userSettings.aiEnabled })
			.from(userSettings)
			.where(eq(userSettings.userId, userId));
		if (settings && !settings.aiEnabled) {
			return { available: false, reason: 'disabled_by_user' };
		}

		const [credential] = await this.db
			.select()
			.from(userAiCredentials)
			.where(and(eq(userAiCredentials.userId, userId), ne(userAiCredentials.status, 'revoked')))
			.orderBy(desc(userAiCredentials.isPrimary), desc(userAiCredentials.createdAt))
			.limit(1);

		if (credential?.status === 'active') {
			return {
				available: true,
				source: 'user',
				credentialId: credential.id,
				config: {
					provider: credential.providerCode as AiProviderCode,
					apiKey: this.encryption.decrypt(credential),
					baseUrl: credential.baseUrl,
					modelFast: credential.modelFast,
					modelSmart: credential.modelSmart
				}
			};
		}

		if (this.env.INSTANCE_AI_PROVIDER && this.env.INSTANCE_AI_KEY) {
			return {
				available: true,
				source: 'instance',
				credentialId: null,
				config: { provider: this.env.INSTANCE_AI_PROVIDER, apiKey: this.env.INSTANCE_AI_KEY }
			};
		}

		return { available: false, reason: credential ? 'invalid_key' : 'not_configured' };
	}

	client(config: AiProviderConfig): AiClient {
		return this.env.AI_PROVIDER_MODE === 'fake'
			? new FakeAiClient(config.apiKey)
			: new SdkAiClient(config);
	}
}
