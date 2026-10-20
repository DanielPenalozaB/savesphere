import type { AiProviderCode } from '@savesphere/contracts';

export interface AiProviderConfig {
	provider: AiProviderCode;
	apiKey: string;
	baseUrl?: string | null;
	modelFast?: string | null;
	modelSmart?: string | null;
}

export interface AiUsage {
	model: string;
	inputTokens: number;
	outputTokens: number;
}

export interface TransactionSuggestion {
	kind: 'expense' | 'income';
	amount: string;
	description: string;
	categoryName: string | null;
}

/**
 * Port for every AI feature. The API only depends on this interface; adapters decide
 * whether calls go to a real provider or return deterministic fake data.
 */
export interface AiClient {
	/** Makes a minimal call to confirm the key works. */
	validate(): Promise<boolean>;
	suggestTransaction(
		text: string,
		categoryNames: readonly string[]
	): Promise<{ suggestion: TransactionSuggestion; usage: AiUsage }>;
}
