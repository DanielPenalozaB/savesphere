import type { Actions } from './$types';

export const actions: Actions = {
  addWallet: async ({ request }) => {
    const data = await request.formData();
    const name = data.get('name')?.toString();
    const type = data.get('type')?.toString();
    const balance = data.get('balance')?.toString();
    const currency = data.get('currency')?.toString();

    // TODO: Integrate with backend API
    console.log('Adding wallet:', { name, type, balance, currency });

    return { success: true };
  }
};
