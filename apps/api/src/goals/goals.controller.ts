import { Body, Controller, Get, Post } from '@nestjs/common';
import { createGoalSchema, type CreateGoalInput, type Goal } from '@savesphere/contracts';
import { CurrentUser, type AuthUser } from '../auth/auth.decorators.js';
import { ZodValidationPipe } from '../common/zod-validation.pipe.js';
import { GoalsService } from './goals.service.js';

@Controller('goals')
export class GoalsController {
	constructor(private readonly goals: GoalsService) {}

	@Get()
	list(@CurrentUser() user: AuthUser): Promise<Goal[]> {
		return this.goals.list(user.id);
	}

	@Post()
	create(
		@CurrentUser() user: AuthUser,
		@Body(new ZodValidationPipe(createGoalSchema)) body: CreateGoalInput
	): Promise<Goal> {
		return this.goals.create(user.id, body);
	}
}
