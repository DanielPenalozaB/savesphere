import type { Handle } from '@sveltejs/kit/hooks';
import type { SessionUser } from '#lib/auth/user.ts';

/**
 * Resolves `locals.user` from the session cookie by asking the API (`GET /api/me`), so pages
 * can be guarded during SSR. Requests without a cookie skip the round trip.
 */
export function createSessionHandle(apiUrl: string): Handle {
	return async ({ event, resolve }) => {
		event.locals.user = null;
		const cookie = event.request.headers.get('cookie');
		if (cookie) {
			try {
				const response = await fetch(new URL('/api/me', apiUrl), { headers: { cookie } });
				if (response.ok) {
					const payload = (await response.json()) as { data: SessionUser };
					event.locals.user = payload.data;
				}
			} catch {
				// API unreachable: treat as signed out; the auth pages explain the failure.
			}
		}
		return resolve(event);
	};
}
