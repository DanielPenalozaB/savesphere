import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import {
	createAccountSchema,
	updateAccountSchema,
	type Account,
	type CreateAccountInput,
	type UpdateAccountInput
} from '@savesphere/contracts';
import { CurrentUser, type AuthUser } from '../auth/auth.decorators.js';
import { ZodValidationPipe } from '../common/zod-validation.pipe.js';
import { AccountsService } from './accounts.service.js';

@Controller('accounts')
export class AccountsController {
	constructor(private readonly accounts: AccountsService) {}

	@Get()
	list(@CurrentUser() user: AuthUser): Promise<Account[]> {
		return this.accounts.list(user.id);
	}

	@Get(':id')
	get(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string): Promise<Account> {
		return this.accounts.get(user.id, id);
	}

	@Post()
	create(
		@CurrentUser() user: AuthUser,
		@Body(new ZodValidationPipe(createAccountSchema)) body: CreateAccountInput
	): Promise<Account> {
		return this.accounts.create(user.id, body);
	}

	@Patch(':id')
	update(
		@CurrentUser() user: AuthUser,
		@Param('id', ParseUUIDPipe) id: string,
		@Body(new ZodValidationPipe(updateAccountSchema)) body: UpdateAccountInput
	): Promise<Account> {
		return this.accounts.update(user.id, id, body);
	}
}
