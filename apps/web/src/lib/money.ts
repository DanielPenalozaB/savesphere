import { minorUnitOf } from '@savesphere/contracts';

/** Minor units → plain decimal string ("-1250" + 2 → "-12.50"). Exact: no floats involved. */
export function toDecimalString(minor: number, minorUnit: number): string {
	const negative = minor < 0;
	const digits = Math.abs(minor)
		.toString()
		.padStart(minorUnit + 1, '0');
	const whole = minorUnit === 0 ? digits : digits.slice(0, -minorUnit);
	const fraction = minorUnit === 0 ? '' : `.${digits.slice(-minorUnit)}`;
	return `${negative ? '-' : ''}${whole}${fraction}`;
}

interface FormatOptions {
	/** Prefix positive amounts with "+" (income in lists). */
	signed?: boolean;
	/** Hide the currency symbol, e.g. when a column header already names it. */
	plain?: boolean;
}

/**
 * Formats minor units for display, e.g. 4_732_000_000 COP → "$ 47.320.000" (es-CO) or
 * "$47,320,000" (en-US). Whole amounts drop the decimals; other amounts show all of the currency's minor digits.
 */
export function formatMoney(
	minor: number,
	currency: string,
	locale: string,
	{ signed = false, plain = false }: FormatOptions = {}
): string {
	const minorUnit = minorUnitOf(currency);
	const whole = minor % 10 ** minorUnit === 0;
	const format = new Intl.NumberFormat(locale, {
		...(plain ? {} : { style: 'currency', currency, currencyDisplay: 'narrowSymbol' }),
		minimumFractionDigits: whole ? 0 : minorUnit,
		maximumFractionDigits: whole ? 0 : minorUnit,
		signDisplay: signed ? 'exceptZero' : 'auto'
	});
	// Intl accepts decimal strings, so large amounts never pass through a float.
	return format.format(toDecimalString(minor, minorUnit) as unknown as number);
}

/**
 * Parses an amount typed by the user into minor units, honouring the locale's separators:
 * "25.000" (es) and "25,000" (en) are both twenty-five thousand; "12,5" (es) is 12.50.
 * Returns null for anything that isn't a positive amount with at most `minorUnit` decimals.
 */
export function parseAmount(input: string, currency: string, locale: string): number | null {
	const minorUnit = minorUnitOf(currency);
	const parts = new Intl.NumberFormat(locale).formatToParts(12345.6);
	const group = parts.find((p) => p.type === 'group')?.value ?? ',';
	const decimal = parts.find((p) => p.type === 'decimal')?.value ?? '.';

	let text = input.trim().replace(/[\s\u00a0\u202f$]/g, '');
	text = text.split(group).join('');
	if (decimal !== '.') text = text.replace(decimal, '.');
	if (!/^\d+(\.\d+)?$/.test(text)) return null;

	const [whole = '0', fraction = ''] = text.split('.');
	if (fraction.length > minorUnit) return null;
	const minor = Number(whole + fraction.padEnd(minorUnit, '0'));
	return Number.isSafeInteger(minor) && minor > 0 ? minor : null;
}
