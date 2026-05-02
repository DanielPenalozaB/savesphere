import type { Actions } from './$types';

export const actions: Actions = {
	exchange: async ({ request }) => {
		const data = await request.formData();
		const fromCurrency = data.get('fromCurrency')?.toString();
		const toCurrency = data.get('toCurrency')?.toString();
		const amount = data.get('amount')?.toString();

		// TODO: Integrate with backend API
		console.log('Exchanging currency:', { fromCurrency, toCurrency, amount });

		return { success: true };
	}
};
