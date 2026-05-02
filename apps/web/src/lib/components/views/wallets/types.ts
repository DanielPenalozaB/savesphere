export enum WalletTypeEnum {
  DEBIT = 'debit',
  CREDIT = 'credit',
  SAVINGS = 'savings',
  CASH = 'cash'
}

export enum WalletStatusEnum {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DUE = 'due'
}

export enum WalletCurrencyEnum {
  USD = 'usd',
  EUR = 'eur',
  COP = 'cop'
}

export type Wallet = {
  id: string;
  name: string;
  type: WalletTypeEnum;
  balance: string;
  isPrimary: boolean;
  status: WalletStatusEnum;
  currency: WalletCurrencyEnum;
};
