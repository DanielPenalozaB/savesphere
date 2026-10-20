import { Inject, Injectable } from '@nestjs/common';
import type { Capabilities } from '@savesphere/contracts';
import { channelIdentities, type Database } from '@savesphere/db';
import { and, eq, isNotNull } from 'drizzle-orm';
import { ENV, type Env } from '../config/env.js';
import { DB } from '../database/database.module.js';

/** A chat channel is offered only when the instance has credentials for it. */
@Injectable()
export class ChannelsService {
	constructor(
		@Inject(DB) private readonly db: Database,
		@Inject(ENV) private readonly env: Env
	) {}

	async capabilities(userId: string): Promise<Capabilities['channels']> {
		const linked = await this.db
			.select({ channel: channelIdentities.channel })
			.from(channelIdentities)
			.where(and(eq(channelIdentities.userId, userId), isNotNull(channelIdentities.verifiedAt)));
		const isLinked = (channel: 'telegram' | 'whatsapp') =>
			linked.some((row) => row.channel === channel);

		const telegram = Boolean(this.env.TELEGRAM_BOT_TOKEN);
		const whatsapp = Boolean(this.env.WHATSAPP_ACCESS_TOKEN && this.env.WHATSAPP_PHONE_NUMBER_ID);
		return {
			telegram: {
				available: telegram,
				linked: isLinked('telegram'),
				reason: telegram ? null : 'not_configured'
			},
			whatsapp: {
				available: whatsapp,
				linked: isLinked('whatsapp'),
				reason: whatsapp ? null : 'not_configured'
			}
		};
	}
}
