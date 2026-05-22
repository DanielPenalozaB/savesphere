import type { PageLoad } from './$types';
import type { Wallet, WalletSummary } from '$lib/types/wallet.js';
import { WalletTypeEnum, WalletStatusEnum, WalletCurrencyEnum } from '$lib/types/wallet.js';

export const load: PageLoad = () => {
  // TODO: Replace with real API call: apiGet<Wallet[]>('/api/wallets')
  const wallets: Wallet[] = [
    {
      id: '1',
      name: 'Visa Platinum',
      type: WalletTypeEnum.CREDIT,
      balance: '45200.50',
      isPrimary: true,
      status: WalletStatusEnum.ACTIVE,
      currency: WalletCurrencyEnum.USD
    },
    {
      id: '2',
      name: 'Savings Account',
      type: WalletTypeEnum.SAVINGS,
      balance: '12000.00',
      isPrimary: false,
      status: WalletStatusEnum.ACTIVE,
      currency: WalletCurrencyEnum.USD
    },
    {
      id: '3',
      name: 'Checking Account',
      type: WalletTypeEnum.DEBIT,
      balance: '5000.00',
      isPrimary: false,
      status: WalletStatusEnum.ACTIVE,
      currency: WalletCurrencyEnum.USD
    }
  ];

  const summary: WalletSummary = {
    liquidAssets: '$124,500.00',
    liquidAssetsTrend: 2.4,
    totalDebt: '-$12,400.00',
    totalDebtTrend: -0.5,
    netWorth: '$112,100.00',
    netWorthTrend: 3.1
  };

  return { wallets, summary };
};
