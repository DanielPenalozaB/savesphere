import { Body, Controller, Get, Post } from '@nestjs/common';
import {
	createCategorySchema,
	type Category,
	type CreateCategoryInput
} from '@savesphere/contracts';
import { CurrentUser, type AuthUser } from '../auth/auth.decorators.js';
import { ZodValidationPipe } from '../common/zod-validation.pipe.js';
import { CategoriesService } from './categories.service.js';

@Controller('categories')
export class CategoriesController {
	constructor(private readonly categories: CategoriesService) {}

	@Get()
	list(@CurrentUser() user: AuthUser): Promise<Category[]> {
		return this.categories.list(user.id);
	}

	@Post()
	create(
		@CurrentUser() user: AuthUser,
		@Body(new ZodValidationPipe(createCategorySchema)) body: CreateCategoryInput
	): Promise<Category> {
		return this.categories.create(user.id, body);
	}
}
