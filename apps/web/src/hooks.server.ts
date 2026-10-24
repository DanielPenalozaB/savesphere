import { API_INTERNAL_URL } from '$app/env/private';
import { sequence, type Handle } from '@sveltejs/kit/hooks';
import { getTextDirection } from '#lib/paraglide/runtime.js';
import { paraglideMiddleware } from '#lib/paraglide/server.js';
import { createApiProxy } from '#lib/server/api-proxy.ts';
import { createSessionHandle } from '#lib/server/session.ts';

const handleApi = createApiProxy(API_INTERNAL_URL);
const handleSession = createSessionHandle(API_INTERNAL_URL);

const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		return resolve(
			{ ...event, request },
			{
				transformPageChunk: ({ html }) =>
					html
						.replace('%paraglide.lang%', locale)
						.replace('%paraglide.dir%', getTextDirection(locale))
			}
		);
	});

export const handle: Handle = sequence(handleApi, handleSession, handleParaglide);
