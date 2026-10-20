import { Module } from '@nestjs/common';
import { AiAssistService } from './ai-assist.service.js';
import { AiCapabilityService } from './ai-capability.service.js';
import { AiController } from './ai.controller.js';
import { AiCredentialsService } from './ai-credentials.service.js';
import { KeyEncryptionService } from './key-encryption.service.js';
import { RequiresAiGuard } from './requires-ai.guard.js';

@Module({
	controllers: [AiController],
	providers: [
		KeyEncryptionService,
		AiCapabilityService,
		AiCredentialsService,
		AiAssistService,
		RequiresAiGuard
	],
	exports: [AiCapabilityService, RequiresAiGuard]
})
export class AiModule {}
