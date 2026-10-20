import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	ParseUUIDPipe,
	Post,
	Put,
	Req
} from '@nestjs/common';
import {
	parseTransactionRequestSchema,
	saveAiCredentialSchema,
	type AiCredential,
	type ParsedTransaction,
	type ParseTransactionRequest,
	type SaveAiCredentialInput
} from '@savesphere/contracts';
import { CurrentUser, type AuthUser } from '../auth/auth.decorators.js';
import { ZodValidationPipe } from '../common/zod-validation.pipe.js';
import { AiAssistService } from './ai-assist.service.js';
import { AiCredentialsService } from './ai-credentials.service.js';
import { RequiresAi, type AiRequest } from './requires-ai.guard.js';

@Controller('ai')
export class AiController {
	constructor(
		private readonly credentials: AiCredentialsService,
		private readonly assist: AiAssistService
	) {}

	@Get('credentials')
	list(@CurrentUser() user: AuthUser): Promise<AiCredential[]> {
		return this.credentials.list(user.id);
	}

	@Put('credentials')
	save(
		@CurrentUser() user: AuthUser,
		@Body(new ZodValidationPipe(saveAiCredentialSchema)) body: SaveAiCredentialInput
	): Promise<AiCredential> {
		return this.credentials.save(user.id, body);
	}

	@Delete('credentials/:id')
	@HttpCode(200)
	async remove(
		@CurrentUser() user: AuthUser,
		@Param('id', ParseUUIDPipe) id: string
	): Promise<null> {
		await this.credentials.remove(user.id, id);
		return null;
	}

	@Post('parse-transaction')
	@HttpCode(200)
	@RequiresAi()
	parseTransaction(
		@Req() request: AiRequest,
		@Body(new ZodValidationPipe(parseTransactionRequestSchema)) body: ParseTransactionRequest
	): Promise<ParsedTransaction> {
		return this.assist.parseTransaction(request.ai, request.user.id, body.text);
	}
}
