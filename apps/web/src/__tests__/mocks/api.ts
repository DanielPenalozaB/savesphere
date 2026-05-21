/**
 * Shared mock helpers for API response testing.
 */

export function mockApiResponse<T>(data: T, status = 200): Response {
	return {
		ok: status < 400,
		status,
		json: () => Promise.resolve({ success: true, message: 'ok', data })
	} as Response;
}

export function mockApiError(message: string, status: number): Response {
	return {
		ok: false,
		status,
		json: () => Promise.resolve({ success: false, message, error: message })
	} as Response;
}

export function mockNetworkError(): Promise<Response> {
	return Promise.reject(new Error('Network error'));
}

export function mockNonJsonError(status: number): Response {
	return {
		ok: false,
		status,
		json: () => Promise.reject(new SyntaxError('Unexpected token'))
	} as Response;
}
