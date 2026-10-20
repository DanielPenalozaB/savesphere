import { z } from 'zod';
import { id, isoDateTime } from './common.js';

export const aiProviderCode = z.enum(['anthropic', 'openai', 'google', 'openai_compatible']);
export type AiProviderCode = z.infer<typeof aiProviderCode>;

export const saveAiCredentialSchema = z
	.object({
		provider: aiProviderCode,
		apiKey: z.string().trim().min(8).max(512),
		/** Required for OpenAI-compatible endpoints such as Ollama or LM Studio. */
		baseUrl: z.url().optional(),
		modelFast: z.string().max(100).optional(),
		modelSmart: z.string().max(100).optional(),
		makePrimary: z.boolean().default(true)
	})
	.refine((value) => value.provider !== 'openai_compatible' || value.baseUrl, {
		message: 'baseUrl is required for OpenAI-compatible providers',
		path: ['baseUrl']
	});
export type SaveAiCredentialInput = z.infer<typeof saveAiCredentialSchema>;

/** API keys are never returned; only the last characters are exposed as a hint. */
export const aiCredentialSchema = z.object({
	id,
	provider: aiProviderCode,
	keyHint: z.string(),
	baseUrl: z.string().nullable(),
	modelFast: z.string().nullable(),
	modelSmart: z.string().nullable(),
	isPrimary: z.boolean(),
	status: z.enum(['active', 'invalid', 'revoked']),
	lastValidatedAt: isoDateTime.nullable(),
	createdAt: isoDateTime
});
export type AiCredential = z.infer<typeof aiCredentialSchema>;

export const parseTransactionRequestSchema = z.object({
	text: z.string().trim().min(1).max(500)
});
export type ParseTransactionRequest = z.infer<typeof parseTransactionRequestSchema>;

/** A suggestion only: the client confirms it before anything is saved. */
export const parsedTransactionSchema = z.object({
	kind: z.enum(['expense', 'income']),
	amountMinor: z.number().int().positive(),
	description: z.string(),
	categoryId: id.nullable()
});
export type ParsedTransaction = z.infer<typeof parsedTransactionSchema>;
