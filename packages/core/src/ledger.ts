export type TransactionKind = 'expense' | 'income' | 'transfer' | 'adjustment';

export interface LedgerEntry {
	accountId: string;
	/** Signed amount in the account's minor units: positive = inflow, negative = outflow. */
	amountMinor: bigint;
}

export type TransactionDraft =
	| { kind: 'expense'; accountId: string; amountMinor: bigint }
	| { kind: 'income'; accountId: string; amountMinor: bigint }
	| { kind: 'adjustment'; accountId: string; amountMinor: bigint }
	| {
			kind: 'transfer';
			fromAccountId: string;
			toAccountId: string;
			amountMinor: bigint;
			/** Amount credited to the destination when its currency differs. Defaults to amountMinor. */
			toAmountMinor?: bigint;
	  };

export class LedgerError extends Error {
	override readonly name = 'LedgerError';
}

function assertPositive(value: bigint, field: string): void {
	if (value <= 0n) {
		throw new LedgerError(`${field} must be greater than zero`);
	}
}

/** Turns a user-facing transaction draft into the double-entry rows stored in the ledger. */
export function buildEntries(draft: TransactionDraft): LedgerEntry[] {
	switch (draft.kind) {
		case 'expense':
			assertPositive(draft.amountMinor, 'amountMinor');
			return [{ accountId: draft.accountId, amountMinor: -draft.amountMinor }];
		case 'income':
			assertPositive(draft.amountMinor, 'amountMinor');
			return [{ accountId: draft.accountId, amountMinor: draft.amountMinor }];
		case 'adjustment':
			if (draft.amountMinor === 0n) {
				throw new LedgerError('Adjustment amount cannot be zero');
			}
			return [{ accountId: draft.accountId, amountMinor: draft.amountMinor }];
		case 'transfer': {
			assertPositive(draft.amountMinor, 'amountMinor');
			const toAmount = draft.toAmountMinor ?? draft.amountMinor;
			assertPositive(toAmount, 'toAmountMinor');
			if (draft.fromAccountId === draft.toAccountId) {
				throw new LedgerError('Cannot transfer to the same account');
			}
			return [
				{ accountId: draft.fromAccountId, amountMinor: -draft.amountMinor },
				{ accountId: draft.toAccountId, amountMinor: toAmount }
			];
		}
	}
}

/** Validates that persisted entries are consistent with the transaction kind. */
export function assertValidEntries(kind: TransactionKind, entries: readonly LedgerEntry[]): void {
	if (entries.some((entry) => entry.amountMinor === 0n)) {
		throw new LedgerError('Entries cannot have a zero amount');
	}
	const expected = kind === 'transfer' ? 2 : 1;
	if (entries.length !== expected) {
		throw new LedgerError(
			`A ${kind} must have exactly ${expected} entr${expected === 1 ? 'y' : 'ies'}`
		);
	}
	const [first, second] = entries as [LedgerEntry, LedgerEntry | undefined];
	if (kind === 'expense' && first.amountMinor > 0n) {
		throw new LedgerError('An expense entry must be an outflow');
	}
	if (kind === 'income' && first.amountMinor < 0n) {
		throw new LedgerError('An income entry must be an inflow');
	}
	if (kind === 'transfer' && second) {
		if (first.accountId === second.accountId) {
			throw new LedgerError('Cannot transfer to the same account');
		}
		if (first.amountMinor > 0n === second.amountMinor > 0n) {
			throw new LedgerError('Transfer entries must have opposite signs');
		}
	}
}
