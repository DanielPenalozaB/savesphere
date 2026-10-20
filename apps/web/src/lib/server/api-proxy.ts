import type { Handle } from '@sveltejs/kit/hooks';

// Hop-by-hop headers must not be forwarded; fetch also decodes compressed bodies itself.
const STRIPPED_REQUEST_HEADERS = ['host', 'connection', 'content-length'];
const STRIPPED_RESPONSE_HEADERS = [
	'content-encoding',
	'content-length',
	'transfer-encoding',
	'connection'
];

/**
 * Forwards /api/* to the API service, so the browser only ever talks to one origin:
 * cookies stay first-party and there is no CORS to configure, in dev and in production.
 */
export function createApiProxy(apiUrl: string): Handle {
	return async ({ event, resolve }) => {
		if (!event.url.pathname.startsWith('/api/')) return resolve(event);

		const target = new URL(event.url.pathname + event.url.search, apiUrl);
		const headers = new Headers(event.request.headers);
		for (const name of STRIPPED_REQUEST_HEADERS) headers.delete(name);
		// Without this every user would share the proxy's IP, breaking per-client rate limiting.
		headers.set('x-forwarded-for', event.getClientAddress());
		headers.set('x-forwarded-host', event.url.host);
		headers.set('x-forwarded-proto', event.url.protocol.replace(':', ''));

		const hasBody = !['GET', 'HEAD'].includes(event.request.method);
		try {
			const upstream = await fetch(target, {
				method: event.request.method,
				headers,
				body: hasBody ? await event.request.arrayBuffer() : undefined,
				redirect: 'manual'
			});
			const responseHeaders = new Headers(upstream.headers);
			for (const name of STRIPPED_RESPONSE_HEADERS) responseHeaders.delete(name);
			return new Response(upstream.body, { status: upstream.status, headers: responseHeaders });
		} catch {
			return Response.json(
				{ success: false, error: { code: 'INTERNAL_ERROR', message: 'API unavailable' } },
				{ status: 502 }
			);
		}
	};
}
