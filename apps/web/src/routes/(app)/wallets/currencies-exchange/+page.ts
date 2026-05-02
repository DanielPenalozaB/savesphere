import type { PageLoad } from './$types';
import type { Currency, MarketTrend, ExchangeRate } from '$lib/types/currency.js';

export const load: PageLoad = () => {
	// TODO: Replace with real API calls
	const currencies: Currency[] = [
		{
			code: 'USD',
			name: 'US Dollar',
			symbol: '$',
			balance: '12,450.00',
			isPrimary: true,
			flagUrl:
				'https://lh3.googleusercontent.com/aida-public/AB6AXuB7WvLvXriR97P7VbfOO9lWxmTS-ykZtPe0LwLqrGavJRXRACTcalm_PwntO5sxNxJVHP8RLk-a8WgOBma-XT-egctCMGSwPd_AcfxNTM6vZalWALwN8McYgQNQk_75wrfRViGh6fpy5dLyhKmivVGCGJlXrbdiTS-yMMFATO7xTUJiwjNQSlDP4bozhCAfx3Gi2gMO8v_yWdtI3NSwPiN7KjxRMvYHYQJfrwr4lmP0uj0rKawlravz5pKU2LiaF9Q7IXwoWal60cTw'
		},
		{
			code: 'EUR',
			name: 'Euro',
			symbol: '€',
			balance: '8,210.00',
			isPrimary: false,
			flagUrl:
				'https://lh3.googleusercontent.com/aida-public/AB6AXuB6xth-dzyOX2CBcn5XvIvJ156jFZKqs3VpdYZHoPDTDLyTzPVZ7qORWnLN0fGnxsTeoRKMDnArGrnJRnqM9cZQ4lmWvGb1c_4oDFgqJMDzF8qj-LNKdFDvh6tLFAlBnRtUedPg_sMn2XFf0wLpQBtl8XmbGKEZvnww8WNmBuPI7u8xVTtJVWX8rLm7Jpf_8r9D65I2-YMnqMrxxf1IENGgGogGrrN6nbSxNlr5NwaL2p3dtQvFkIrZ-TkLZBr9iAbCPrhfT8ZArqEr'
		},
		{
			code: 'GBP',
			name: 'British Pound',
			symbol: '£',
			balance: '4,300.00',
			isPrimary: false,
			flagUrl:
				'https://lh3.googleusercontent.com/aida-public/AB6AXuCmIdlSjAXoJPsycbtUr7eH4sbd_ARSlDeXsBgK262Me0aOp5WYJkmad7RFJT1EPeW2Dcqn3Phq5pUP74pe0vp9tsVQ49IRK3fuSD91cqcgdH5QSNDzSh3ASKZzwGaBZoe1qP6Fpfwj0m94EHH_ZwUcWq-Q86otCjtgxODoPUTYw1qr6WPAe1fWIBlIhF9-5jSr9JB-CnqbzqiSVcoQEK-dTFZoS6qz_NY6Wdt-H1vUqqwSKWhs2ef37kQPo2qJevNjxmu_HnAk7Yi7'
		},
		{
			code: 'JPY',
			name: 'Japanese Yen',
			symbol: '¥',
			balance: '1,250,400',
			isPrimary: false,
			flagUrl:
				'https://lh3.googleusercontent.com/aida-public/AB6AXuBq6mNa2HrJtSKXs0WJrlyIBU4yKvc8-gfxZzcEu04aiKIYNjropiEhlUMOC26JhNLkft8ZRbK7t2cxv_1T5u6bv_w4mNxCPavU6Z4G4VA6Rw0pWKvzXAoeAKmndogv4KT1P2YsxUm3K6euO4caVNo-yrEEShFzuTuxdaFfxtZfOvBcOmGhaP2Uev1phQ9CfPhGagqgGnnV8h8Yax8VR66w_SFbsqDQl-c_z6ZbJmAX_fKRlLrHE6dfektXziWv-AW6jP2QnxaIcFCU'
		}
	];

	const marketTrends: MarketTrend[] = [
		{ pair: 'USD / EUR', lastPrice: '0.9234', change: '+1.24%', isPositive: true },
		{ pair: 'GBP / USD', lastPrice: '1.2645', change: '-0.45%', isPositive: false },
		{ pair: 'USD / JPY', lastPrice: '151.22', change: '+0.82%', isPositive: true }
	];

	const exchangeRate: ExchangeRate = {
		from: 'USD',
		to: 'EUR',
		rate: 0.9234,
		feePercent: 0.5,
		feeAmount: '$5.00',
		estimatedTotal: '918.78 EUR',
		lastUpdated: '2 minutes ago'
	};

	return { currencies, marketTrends, exchangeRate };
};
