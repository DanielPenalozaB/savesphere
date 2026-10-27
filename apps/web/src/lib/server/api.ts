import type { RequestEvent } from '@sveltejs/kit';
import { createApiClient } from '#lib/api/client.ts';

/**
 * API client for load functions and actions. Uses `event.fetch`, so requests go through the
 * /api proxy with the user's cookies.
 */
export function serverApi(event: Pick<RequestEvent, 'fetch'>) {
	return createApiClient(event.fetch);
}
