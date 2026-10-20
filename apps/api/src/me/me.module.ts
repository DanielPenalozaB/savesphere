import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module.js';
import { ChannelsModule } from '../channels/channels.module.js';
import { MeController } from './me.controller.js';
import { MeService } from './me.service.js';

@Module({
	imports: [AiModule, ChannelsModule],
	controllers: [MeController],
	providers: [MeService]
})
export class MeModule {}
