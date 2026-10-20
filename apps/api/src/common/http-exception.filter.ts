import {
	Catch,
	HttpException,
	HttpStatus,
	Logger,
	type ArgumentsHost,
	type ExceptionFilter
} from '@nestjs/common';
import { ErrorCode, type ApiFailure } from '@savesphere/contracts';
import { LedgerError, MoneyError } from '@savesphere/core';
import type { Response } from 'express';
import { AppError } from './app-error.js';

const STATUS_CODES: Partial<Record<number, ErrorCode>> = {
	[HttpStatus.BAD_REQUEST]: ErrorCode.ValidationFailed,
	[HttpStatus.UNAUTHORIZED]: ErrorCode.Unauthorized,
	[HttpStatus.FORBIDDEN]: ErrorCode.Forbidden,
	[HttpStatus.NOT_FOUND]: ErrorCode.NotFound,
	[HttpStatus.CONFLICT]: ErrorCode.Conflict
};

/** Maps every error to the `{ success: false, error }` envelope. */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
	private readonly logger = new Logger(HttpExceptionFilter.name);

	catch(exception: unknown, host: ArgumentsHost): void {
		const response = host.switchToHttp().getResponse<Response>();
		const { status, body } = this.toFailure(exception);
		if (status >= 500) {
			this.logger.error(exception instanceof Error ? exception.stack : exception);
		}
		response.status(status).json(body);
	}

	private toFailure(exception: unknown): { status: number; body: ApiFailure } {
		if (exception instanceof AppError) {
			return {
				status: exception.status,
				body: {
					success: false,
					error: { code: exception.code, message: exception.message, details: exception.details }
				}
			};
		}
		if (exception instanceof LedgerError || exception instanceof MoneyError) {
			return {
				status: HttpStatus.UNPROCESSABLE_ENTITY,
				body: {
					success: false,
					error: { code: ErrorCode.ValidationFailed, message: exception.message }
				}
			};
		}
		if (exception instanceof HttpException) {
			const status = exception.getStatus();
			return {
				status,
				body: {
					success: false,
					error: { code: STATUS_CODES[status] ?? ErrorCode.Internal, message: exception.message }
				}
			};
		}
		return {
			status: HttpStatus.INTERNAL_SERVER_ERROR,
			body: {
				success: false,
				error: { code: ErrorCode.Internal, message: 'Internal server error' }
			}
		};
	}
}
