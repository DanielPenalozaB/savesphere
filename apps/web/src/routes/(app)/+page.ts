import type { PageLoad } from './$types';
import type { Wallet } from '$lib/types/wallet.js';
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
      name: 'High-Yield Savings',
      type: WalletTypeEnum.SAVINGS,
      balance: '78391.20',
      isPrimary: false,
      status: WalletStatusEnum.ACTIVE,
      currency: WalletCurrencyEnum.USD
    },
    {
      id: '3',
      name: 'Physical Cash',
      type: WalletTypeEnum.CASH,
      balance: '1000.00',
      isPrimary: false,
      status: WalletStatusEnum.ACTIVE,
      currency: WalletCurrencyEnum.USD
    }
  ];

  const totalBalance = wallets.reduce((sum, w) => sum + Number.parseFloat(w.balance), 0);

  return {
    wallets,
    totalBalance: totalBalance.toFixed(2),
    totalBalanceDisplay: `$${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    monthlyTrend: 3.2
  };
};
