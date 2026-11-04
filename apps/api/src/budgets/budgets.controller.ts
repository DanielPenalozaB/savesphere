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
	Query
} from '@nestjs/common';
import {
	budgetSpendingQuerySchema,
	createBudgetSchema,
	updateBudgetSchema,
	type Budget,
	type BudgetSpending,
	type BudgetSpendingQuery,
	type CreateBudgetInput,
	type UpdateBudgetInput
} from '@savesphere/contracts';
import { CurrentUser, type AuthUser } from '../auth/auth.decorators.js';
import { ZodValidationPipe } from '../common/zod-validation.pipe.js';
import { BudgetsService } from './budgets.service.js';

@Controller('budgets')
export class BudgetsController {
	constructor(private readonly budgets: BudgetsService) {}

	@Get()
	list(@CurrentUser() user: AuthUser): Promise<Budget[]> {
		return this.budgets.list(user.id);
	}

	@Post()
	create(
		@CurrentUser() user: AuthUser,
		@Body(new ZodValidationPipe(createBudgetSchema)) body: CreateBudgetInput
	): Promise<Budget> {
		return this.budgets.create(user.id, body);
	}

	@Put(':id')
	update(
		@CurrentUser() user: AuthUser,
		@Param('id', ParseUUIDPipe) id: string,
		@Body(new ZodValidationPipe(updateBudgetSchema)) body: UpdateBudgetInput
	): Promise<Budget> {
		return this.budgets.update(user.id, id, body);
	}

	@Delete(':id')
	@HttpCode(200)
	async remove(
		@CurrentUser() user: AuthUser,
		@Param('id', ParseUUIDPipe) id: string
	): Promise<null> {
		await this.budgets.remove(user.id, id);
		return null;
	}

	@Get(':id/spending')
	spending(
		@CurrentUser() user: AuthUser,
		@Param('id', ParseUUIDPipe) id: string,
		@Query(new ZodValidationPipe(budgetSpendingQuerySchema)) query: BudgetSpendingQuery
	): Promise<BudgetSpending> {
		return this.budgets.spending(user.id, id, query);
	}
}
