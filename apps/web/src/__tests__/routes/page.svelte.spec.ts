import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Page from '../../routes/(app)/+page.svelte';
import { WalletTypeEnum, WalletStatusEnum, WalletCurrencyEnum } from '$lib/types/wallet.js';

describe('/+page.svelte', () => {
  it('should render h1 with total balance', async () => {
    render(Page, {
      props: {
        data: {
          wallets: [
            {
              id: '1',
              name: 'Test Wallet',
              type: WalletTypeEnum.CREDIT,
              balance: '1000.00',
              isPrimary: true,
              status: WalletStatusEnum.ACTIVE,
              currency: WalletCurrencyEnum.USD
            }
          ],
          totalBalance: '1000.00',
          totalBalanceDisplay: '$1,000.00',
          monthlyTrend: 3.2
        }
      }
    });

    const heading = page.getByRole('heading', { level: 1 });
    await expect.element(heading).toBeInTheDocument();
    await expect.element(heading).toHaveTextContent('$1,000.00');
  });
});
