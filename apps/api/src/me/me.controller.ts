import { Body, Controller, Get, Patch } from '@nestjs/common';
import {
	updateUserSettingsSchema,
	type Capabilities,
	type UpdateUserSettingsInput,
	type UserSettings
} from '@savesphere/contracts';
import { CurrentUser, type AuthUser } from '../auth/auth.decorators.js';
import { ZodValidationPipe } from '../common/zod-validation.pipe.js';
import { MeService } from './me.service.js';

@Controller('me')
export class MeController {
	constructor(private readonly me: MeService) {}

	@Get()
	profile(@CurrentUser() user: AuthUser): AuthUser {
		return user;
	}

	@Get('capabilities')
	capabilities(@CurrentUser() user: AuthUser): Promise<Capabilities> {
		return this.me.capabilities(user.id);
	}

	@Get('settings')
	settings(@CurrentUser() user: AuthUser): Promise<UserSettings> {
		return this.me.settings(user.id);
	}

	@Patch('settings')
	updateSettings(
		@CurrentUser() user: AuthUser,
		@Body(new ZodValidationPipe(updateUserSettingsSchema)) body: UpdateUserSettingsInput
	): Promise<UserSettings> {
		return this.me.updateSettings(user.id, body);
	}
}
