import { createApiClient } from '#lib/api/client.ts';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	const healthy = await createApiClient(fetch)
		.get<{ status: 'ok' }>('/health')
		.then(() => true)
		.catch(() => false);
	return { healthy };
};
