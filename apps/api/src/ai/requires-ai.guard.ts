import {
	applyDecorators,
	HttpStatus,
	Injectable,
	UseGuards,
	type CanActivate,
	type ExecutionContext
} from '@nestjs/common';
import { ErrorCode } from '@savesphere/contracts';
import type { AuthenticatedRequest } from '../auth/auth.decorators.js';
import { AppError } from '../common/app-error.js';
import { AiCapabilityService, type AiResolution } from './ai-capability.service.js';

export type AiRequest = AuthenticatedRequest & { ai: Extract<AiResolution, { available: true }> };

/** Blocks AI-only endpoints when AI is unavailable; the UI shows them locked, the API enforces it. */
@Injectable()
export class RequiresAiGuard implements CanActivate {
	constructor(private readonly capabilities: AiCapabilityService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest<AiRequest>();
		const resolution = await this.capabilities.resolve(request.user.id);
		if (!resolution.available) {
			throw new AppError(
				ErrorCode.AiNotConfigured,
				HttpStatus.FORBIDDEN,
				'Connect an AI provider in Settings to use this feature',
				{ reason: resolution.reason }
			);
		}
		request.ai = resolution;
		return true;
	}
}

export const RequiresAi = () => applyDecorators(UseGuards(RequiresAiGuard));
