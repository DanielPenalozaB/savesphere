export class MoneyError extends Error {
	override readonly name = 'MoneyError';
}

const CURRENCY_CODE = /^[A-Z]{3}$/;

/**
 * Immutable monetary amount stored in minor units (e.g. cents) as a bigint.
 * Floats are never used for money.
 */
export class Money {
	private constructor(
		readonly minor: bigint,
		readonly currency: string
	) {}

	static of(minor: bigint | number, currency: string): Money {
		if (!CURRENCY_CODE.test(currency)) {
			throw new MoneyError(`Invalid ISO 4217 currency code: ${currency}`);
		}
		if (typeof minor === 'number' && !Number.isSafeInteger(minor)) {
			throw new MoneyError(`Minor units must be a safe integer, got ${minor}`);
		}
		return new Money(BigInt(minor), currency);
	}

	static zero(currency: string): Money {
		return Money.of(0n, currency);
	}

	/** Parses a decimal string such as "12.50" using the currency's minor unit exponent. */
	static parse(amount: string, currency: string, minorUnit: number): Money {
		const match = /^(-)?(\d+)(?:\.(\d+))?$/.exec(amount.trim());
		if (!match) {
			throw new MoneyError(`Invalid amount: ${amount}`);
		}
		const [, sign, whole = '0', fraction = ''] = match;
		if (fraction.length > minorUnit) {
			throw new MoneyError(`Amount ${amount} has more than ${minorUnit} decimal places`);
		}
		const minor = BigInt(whole + fraction.padEnd(minorUnit, '0'));
		return Money.of(sign ? -minor : minor, currency);
	}

	add(other: Money): Money {
		this.assertSameCurrency(other);
		return new Money(this.minor + other.minor, this.currency);
	}

	subtract(other: Money): Money {
		this.assertSameCurrency(other);
		return new Money(this.minor - other.minor, this.currency);
	}

	negate(): Money {
		return new Money(-this.minor, this.currency);
	}

	abs(): Money {
		return this.minor < 0n ? this.negate() : this;
	}

	isZero(): boolean {
		return this.minor === 0n;
	}

	isPositive(): boolean {
		return this.minor > 0n;
	}

	isNegative(): boolean {
		return this.minor < 0n;
	}

	equals(other: Money): boolean {
		return this.currency === other.currency && this.minor === other.minor;
	}

	compare(other: Money): -1 | 0 | 1 {
		this.assertSameCurrency(other);
		if (this.minor === other.minor) return 0;
		return this.minor < other.minor ? -1 : 1;
	}

	/** Formats as a plain decimal string, e.g. "-12.50". */
	toDecimalString(minorUnit: number): string {
		const negative = this.minor < 0n;
		const digits = (negative ? -this.minor : this.minor).toString().padStart(minorUnit + 1, '0');
		const whole = minorUnit === 0 ? digits : digits.slice(0, -minorUnit);
		const fraction = minorUnit === 0 ? '' : `.${digits.slice(-minorUnit)}`;
		return `${negative ? '-' : ''}${whole}${fraction}`;
	}

	private assertSameCurrency(other: Money): void {
		if (this.currency !== other.currency) {
			throw new MoneyError(`Currency mismatch: ${this.currency} vs ${other.currency}`);
		}
	}
}

export function sum(amounts: readonly Money[], currency: string): Money {
	return amounts.reduce((total, amount) => total.add(amount), Money.zero(currency));
}
