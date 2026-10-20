import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText, Output, type LanguageModel } from 'ai';
import { z } from 'zod';
import type { AiClient, AiProviderConfig, AiUsage, TransactionSuggestion } from './ai-client.js';

const DEFAULT_MODELS = {
	anthropic: { fast: 'claude-haiku-5-5', smart: 'claude-sonnet-5-5' },
	openai: { fast: 'gpt-5-mini', smart: 'gpt-5' },
	google: { fast: 'gemini-2.5-flash', smart: 'gemini-2.5-pro' },
	openai_compatible: { fast: 'llama3.1', smart: 'llama3.1' }
} as const;

const suggestionSchema = z.object({
	kind: z.enum(['expense', 'income']),
	amount: z.string().describe('Decimal amount without currency symbols, e.g. "12.50"'),
	description: z.string().describe('Short, human-friendly description'),
	categoryName: z.string().nullable().describe('One of the provided category names, or null')
});

/** Real adapter backed by the Vercel AI SDK, which normalizes every provider. */
export class SdkAiClient implements AiClient {
	constructor(private readonly config: AiProviderConfig) {}

	async validate(): Promise<boolean> {
		try {
			await generateText({
				model: this.model('fast'),
				prompt: 'Reply with OK.',
				maxOutputTokens: 5
			});
			return true;
		} catch {
			return false;
		}
	}

	async suggestTransaction(
		text: string,
		categoryNames: readonly string[]
	): Promise<{ suggestion: TransactionSuggestion; usage: AiUsage }> {
		const modelId = this.modelId('fast');
		const result = await generateText({
			model: this.model('fast'),
			output: Output.object({ schema: suggestionSchema }),
			system:
				'You turn short personal-finance notes into a structured transaction. ' +
				'Never invent amounts. Pick categoryName only from the provided list.',
			prompt: `Categories: ${categoryNames.join(', ')}\nNote: ${text}`
		});
		return {
			suggestion: result.output,
			usage: {
				model: modelId,
				inputTokens: result.usage.inputTokens ?? 0,
				outputTokens: result.usage.outputTokens ?? 0
			}
		};
	}

	private modelId(tier: 'fast' | 'smart'): string {
		const override = tier === 'fast' ? this.config.modelFast : this.config.modelSmart;
		return override ?? DEFAULT_MODELS[this.config.provider][tier];
	}

	private model(tier: 'fast' | 'smart'): LanguageModel {
		const { provider, apiKey, baseUrl } = this.config;
		const id = this.modelId(tier);
		switch (provider) {
			case 'anthropic':
				return createAnthropic({ apiKey })(id);
			case 'openai':
				return createOpenAI({ apiKey })(id);
			case 'google':
				return createGoogleGenerativeAI({ apiKey })(id);
			case 'openai_compatible':
				return createOpenAI({ apiKey, baseURL: baseUrl ?? undefined }).chat(id);
		}
	}
}
