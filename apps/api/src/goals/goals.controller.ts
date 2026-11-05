import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import {
	createGoalAllocationSchema,
	createGoalSchema,
	updateGoalSchema,
	type CreateGoalAllocationInput,
	type CreateGoalInput,
	type Goal,
	type UpdateGoalInput
} from '@savesphere/contracts';
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

	@Get(':id')
	get(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string): Promise<Goal> {
		return this.goals.get(user.id, id);
	}

	@Post()
	create(
		@CurrentUser() user: AuthUser,
		@Body(new ZodValidationPipe(createGoalSchema)) body: CreateGoalInput
	): Promise<Goal> {
		return this.goals.create(user.id, body);
	}

	@Patch(':id')
	update(
		@CurrentUser() user: AuthUser,
		@Param('id', ParseUUIDPipe) id: string,
		@Body(new ZodValidationPipe(updateGoalSchema)) body: UpdateGoalInput
	): Promise<Goal> {
		return this.goals.update(user.id, id, body);
	}

	@Post(':id/allocations')
	allocate(
		@CurrentUser() user: AuthUser,
		@Param('id', ParseUUIDPipe) id: string,
		@Body(new ZodValidationPipe(createGoalAllocationSchema)) body: CreateGoalAllocationInput
	): Promise<Goal> {
		return this.goals.allocate(user.id, id, body);
	}
}
