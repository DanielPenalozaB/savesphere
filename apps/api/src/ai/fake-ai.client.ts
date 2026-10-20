import type { AiClient, AiUsage, TransactionSuggestion } from './ai-client.js';

const INCOME_WORDS = /\b(salary|paid|payday|income|got|received|freelance)\b/i;
const FAKE_USAGE: AiUsage = { model: 'fake', inputTokens: 0, outputTokens: 0 };

/** Deterministic adapter used by tests and local development. Keys starting with "invalid" fail. */
export class FakeAiClient implements AiClient {
	constructor(private readonly apiKey: string) {}

	async validate(): Promise<boolean> {
		return !this.apiKey.startsWith('invalid');
	}

	async suggestTransaction(
		text: string,
		categoryNames: readonly string[]
	): Promise<{ suggestion: TransactionSuggestion; usage: AiUsage }> {
		const amount = /(\d+(?:\.\d{1,2})?)/.exec(text)?.[1] ?? '0';
		const description = text.replace(amount, '').replace(/\s+/g, ' ').trim() || 'Transaction';
		const lowered = description.toLowerCase();
		const categoryName =
			categoryNames.find((name) =>
				name
					.toLowerCase()
					.split(/\W+/)
					.some((word) => word.length > 3 && lowered.includes(word))
			) ?? null;
		return {
			suggestion: {
				kind: INCOME_WORDS.test(text) ? 'income' : 'expense',
				amount,
				description,
				categoryName
			},
			usage: FAKE_USAGE
		};
	}
}
