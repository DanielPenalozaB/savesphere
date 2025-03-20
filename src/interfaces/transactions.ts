export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense'
}

export enum TransactionRecurringInterval {
  NONE = 'none',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly'
}

export enum TransactionCurrency {
  USD = 'USD',
  EUR = 'EUR',
  COP = 'COP',
  MXN = 'MXN',
  GBP = 'GBP',
  JPY = 'JPY'
}

export interface Transaction {
  id: string;
  type: TransactionType;
  date: string;
  recurring: TransactionRecurringInterval;
  amount: number;
  amountCurrency: TransactionCurrency;
  title: string;
  description: string;
  category: string;
  tags: string[];
  account: string;
  image: string;
  items: TransactionItem[];
}

export interface TransactionItem {
  id: string
  concept: string
  quantity: number
  price: number
  productId?: string
}