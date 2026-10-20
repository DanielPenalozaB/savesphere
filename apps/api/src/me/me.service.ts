import { Inject, Injectable } from '@nestjs/common';
import type { Capabilities, UpdateUserSettingsInput, UserSettings } from '@savesphere/contracts';
import { userSettings, type Database } from '@savesphere/db';
import { eq } from 'drizzle-orm';
import { AiCapabilityService } from '../ai/ai-capability.service.js';
import { ChannelsService } from '../channels/channels.service.js';
import { AppError } from '../common/app-error.js';
import { DB } from '../database/database.module.js';
import { pgError, PG_FOREIGN_KEY_VIOLATION } from '../database/pg-errors.js';

@Injectable()
export class MeService {
	constructor(
		@Inject(DB) private readonly db: Database,
		private readonly ai: AiCapabilityService,
		private readonly channels: ChannelsService
	) {}

	async capabilities(userId: string): Promise<Capabilities> {
		const [ai, channels] = await Promise.all([
			this.ai.resolve(userId),
			this.channels.capabilities(userId)
		]);
		return {
			ai: ai.available
				? { available: true, reason: null, source: ai.source }
				: { available: false, reason: ai.reason, source: null },
			channels
		};
	}

	async settings(userId: string): Promise<UserSettings> {
		const [row] = await this.db.select().from(userSettings).where(eq(userSettings.userId, userId));
		if (!row) throw AppError.notFound('Settings');
		return toDto(row);
	}

	async updateSettings(userId: string, input: UpdateUserSettingsInput): Promise<UserSettings> {
		if (input.timezone && !isValidTimezone(input.timezone)) {
			throw AppError.validation('Unknown timezone');
		}
		try {
			const [row] = await this.db
				.update(userSettings)
				.set(input)
				.where(eq(userSettings.userId, userId))
				.returning();
			if (!row) throw AppError.notFound('Settings');
			return toDto(row);
		} catch (error) {
			if (pgError(error)?.code === PG_FOREIGN_KEY_VIOLATION)
				throw AppError.validation('Unsupported currency');
			throw error;
		}
	}
}

function isValidTimezone(timezone: string): boolean {
	try {
		new Intl.DateTimeFormat('en-US', { timeZone: timezone });
		return true;
	} catch {
		return false;
	}
}

function toDto(row: typeof userSettings.$inferSelect): UserSettings {
	return {
		baseCurrency: row.baseCurrency,
		timezone: row.timezone,
		locale: row.locale,
		weekStartsOn: row.weekStartsOn,
		monthStartDay: row.monthStartDay,
		aiEnabled: row.aiEnabled
	};
}
