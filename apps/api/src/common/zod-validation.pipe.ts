import { Injectable, type PipeTransform } from '@nestjs/common';
import type { z } from 'zod';
import { AppError } from './app-error.js';

/** Validates and parses a request body / query with a shared contract schema. */
@Injectable()
export class ZodValidationPipe<S extends z.ZodType> implements PipeTransform<unknown, z.output<S>> {
	constructor(private readonly schema: S) {}

	transform(value: unknown): z.output<S> {
		const result = this.schema.safeParse(value);
		if (!result.success) {
			throw AppError.validation(
				'Request validation failed',
				result.error.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message }))
			);
		}
		return result.data;
	}
}
