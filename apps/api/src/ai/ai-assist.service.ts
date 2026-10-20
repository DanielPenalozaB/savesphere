import { Inject, Injectable } from '@nestjs/common';
import type { ParsedTransaction } from '@savesphere/contracts';
import { Money } from '@savesphere/core';
import { aiUsage, categories, currencies, userSettings, type Database } from '@savesphere/db';
import { and, eq, isNull } from 'drizzle-orm';
import { DB } from '../database/database.module.js';
import { toSafeNumber } from '../common/iso.js';
import { AiCapabilityService } from './ai-capability.service.js';
import type { AiRequest } from './requires-ai.guard.js';

@Injectable()
export class AiAssistService {
	constructor(
		@Inject(DB) private readonly db: Database,
		private readonly capabilities: AiCapabilityService
	) {}

	/** Natural language → transaction suggestion. Nothing is persisted except usage. */
	async parseTransaction(
		ai: AiRequest['ai'],
		userId: string,
		text: string
	): Promise<ParsedTransaction> {
		const userCategories = await this.db
			.select({ id: categories.id, name: categories.name, kind: categories.kind })
			.from(categories)
			.where(and(eq(categories.userId, userId), isNull(categories.archivedAt)));

		const { suggestion, usage } = await this.capabilities.client(ai.config).suggestTransaction(
			text,
			userCategories.map((category) => category.name)
		);

		await this.db.insert(aiUsage).values({
			userId,
			credentialId: ai.credentialId,
			feature: 'parse_transaction',
			model: usage.model,
			inputTokens: usage.inputTokens,
			outputTokens: usage.outputTokens
		});

		const [currency] = await this.db
			.select({ code: currencies.code, minorUnit: currencies.minorUnit })
			.from(userSettings)
			.innerJoin(currencies, eq(currencies.code, userSettings.baseCurrency))
			.where(eq(userSettings.userId, userId));

		const category = userCategories.find(
			(candidate) =>
				candidate.name === suggestion.categoryName && candidate.kind === suggestion.kind
		);
		return {
			kind: suggestion.kind,
			amountMinor: toSafeNumber(
				Money.parse(suggestion.amount, currency?.code ?? 'USD', currency?.minorUnit ?? 2).minor
			),
			description: suggestion.description,
			categoryId: category?.id ?? null
		};
	}
}
