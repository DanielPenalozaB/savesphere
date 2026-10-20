import { HttpStatus } from '@nestjs/common';
import { ErrorCode } from '@savesphere/contracts';

export class AppError extends Error {
	constructor(
		readonly code: ErrorCode,
		readonly status: HttpStatus,
		message: string,
		readonly details?: unknown
	) {
		super(message);
		this.name = 'AppError';
	}

	static notFound(resource: string): AppError {
		return new AppError(ErrorCode.NotFound, HttpStatus.NOT_FOUND, `${resource} not found`);
	}

	static conflict(message: string): AppError {
		return new AppError(ErrorCode.Conflict, HttpStatus.CONFLICT, message);
	}

	static validation(message: string, details?: unknown): AppError {
		return new AppError(
			ErrorCode.ValidationFailed,
			HttpStatus.UNPROCESSABLE_ENTITY,
			message,
			details
		);
	}
}
