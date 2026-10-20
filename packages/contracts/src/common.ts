import { z } from 'zod';

export const ErrorCode = {
	ValidationFailed: 'VALIDATION_FAILED',
	Unauthorized: 'UNAUTHORIZED',
	Forbidden: 'FORBIDDEN',
	NotFound: 'NOT_FOUND',
	Conflict: 'CONFLICT',
	AiNotConfigured: 'AI_NOT_CONFIGURED',
	ChannelNotConfigured: 'CHANNEL_NOT_CONFIGURED',
	Internal: 'INTERNAL_ERROR'
} as const;
export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

/** Every successful API response is wrapped as `{ success: true, data }`. */
export type ApiSuccess<T> = { success: true; data: T };

/** Every failed API response is wrapped as `{ success: false, error }`. */
export type ApiFailure = {
	success: false;
	error: { code: ErrorCode; message: string; details?: unknown };
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export const id = z.uuid();

/** ISO 4217 currency code. */
export const currencyCode = z.string().regex(/^[A-Z]{3}$/, 'Must be an ISO 4217 code');

/**
 * Amount in minor units (e.g. cents). Sent as a JSON number; the database stores bigint.
 * Safe integers cover ±90 trillion in a 2-decimal currency.
 */
export const amountMinor = z.number().int().safe();
export const positiveAmountMinor = amountMinor.positive();

export const isoDateTime = z.iso.datetime({ offset: true });
