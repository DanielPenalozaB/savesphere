export type Currency = {
	code: string;
	name: string;
	symbol: string;
	balance: string;
	isPrimary: boolean;
	flagUrl: string;
};

export type MarketTrend = {
	pair: string;
	lastPrice: string;
	change: string;
	isPositive: boolean;
};

export type ExchangeRate = {
	from: string;
	to: string;
	rate: number;
	feePercent: number;
	feeAmount: string;
	estimatedTotal: string;
	lastUpdated: string;
};
