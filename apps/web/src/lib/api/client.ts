import type { ApiResponse, ErrorCode } from '@savesphere/contracts';

export class ApiError extends Error {
	constructor(
		readonly code: ErrorCode,
		message: string,
		readonly status: number,
		readonly details?: unknown
	) {
		super(message);
		this.name = 'ApiError';
	}
}

type Fetch = typeof fetch;

/**
 * Typed client for the SaveSphere API. Works in the browser and in SvelteKit load functions
 * (pass the `fetch` from the load event so cookies are forwarded during SSR).
 */
export function createApiClient(fetchFn: Fetch = fetch) {
	async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
		const response = await fetchFn(`/api${path}`, {
			method,
			credentials: 'include',
			headers: body === undefined ? undefined : { 'content-type': 'application/json' },
			body: body === undefined ? undefined : JSON.stringify(body)
		});
		const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null;
		if (!payload) {
			throw new ApiError(
				'INTERNAL_ERROR',
				`Unexpected response (${response.status})`,
				response.status
			);
		}
		if (!payload.success) {
			const { code, message, details } = payload.error;
			throw new ApiError(code, message, response.status, details);
		}
		return payload.data;
	}

	return {
		get: <T>(path: string) => request<T>('GET', path),
		post: <T>(path: string, body?: unknown) => request<T>('POST', path, body ?? {}),
		put: <T>(path: string, body: unknown) => request<T>('PUT', path, body),
		patch: <T>(path: string, body: unknown) => request<T>('PATCH', path, body),
		delete: <T>(path: string) => request<T>('DELETE', path)
	};
}

export type ApiClient = ReturnType<typeof createApiClient>;
