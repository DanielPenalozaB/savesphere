import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	ParseUUIDPipe,
	Post,
	Query
} from '@nestjs/common';
import {
	createTransactionSchema,
	listTransactionsQuerySchema,
	transactionSummaryQuerySchema,
	type CreateTransactionInput,
	type ListTransactionsQuery,
	type Transaction,
	type TransactionPage,
	type TransactionSummary,
	type TransactionSummaryQuery
} from '@savesphere/contracts';
import { CurrentUser, type AuthUser } from '../auth/auth.decorators.js';
import { ZodValidationPipe } from '../common/zod-validation.pipe.js';
import { TransactionsService } from './transactions.service.js';

@Controller('transactions')
export class TransactionsController {
	constructor(private readonly transactions: TransactionsService) {}

	@Get()
	list(
		@CurrentUser() user: AuthUser,
		@Query(new ZodValidationPipe(listTransactionsQuerySchema)) query: ListTransactionsQuery
	): Promise<TransactionPage> {
		return this.transactions.list(user.id, query);
	}

	// Declared before ':id' so "summary" isn't parsed as a transaction id.
	@Get('summary')
	summary(
		@CurrentUser() user: AuthUser,
		@Query(new ZodValidationPipe(transactionSummaryQuerySchema)) query: TransactionSummaryQuery
	): Promise<TransactionSummary> {
		return this.transactions.summary(user.id, query);
	}

	@Get(':id')
	get(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string): Promise<Transaction> {
		return this.transactions.get(user.id, id);
	}

	@Post()
	create(
		@CurrentUser() user: AuthUser,
		@Body(new ZodValidationPipe(createTransactionSchema)) body: CreateTransactionInput
	): Promise<Transaction> {
		return this.transactions.create(user.id, body);
	}

	@Delete(':id')
	@HttpCode(200)
	async remove(
		@CurrentUser() user: AuthUser,
		@Param('id', ParseUUIDPipe) id: string
	): Promise<null> {
		await this.transactions.remove(user.id, id);
		return null;
	}
}
