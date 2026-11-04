/**
 * Currencies the app supports, with their ISO 4217 minor unit exponent. Clients need the exponent
 * to turn typed amounts into minor units and back. Must match `CURRENCIES` in the db seed (an API
 * unit test checks it).
 */
export const SUPPORTED_CURRENCIES = [
	{ code: 'USD', minorUnit: 2 },
	{ code: 'EUR', minorUnit: 2 },
	{ code: 'GBP', minorUnit: 2 },
	{ code: 'CAD', minorUnit: 2 },
	{ code: 'MXN', minorUnit: 2 },
	{ code: 'COP', minorUnit: 2 },
	{ code: 'ARS', minorUnit: 2 },
	{ code: 'CLP', minorUnit: 0 },
	{ code: 'PEN', minorUnit: 2 },
	{ code: 'BRL', minorUnit: 2 },
	{ code: 'JPY', minorUnit: 0 }
] as const;

export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number]['code'];

/** Minor unit exponent for a currency code; 2 for codes outside the supported list. */
export function minorUnitOf(currency: string): number {
	return SUPPORTED_CURRENCIES.find((c) => c.code === currency)?.minorUnit ?? 2;
}
