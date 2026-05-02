import type { Handle } from '@sveltejs/kit';
import { paraglideMiddleware } from '$lib/paraglide/server';

const handleParaglide: Handle = ({ event, resolve }) =>
  paraglideMiddleware(event.request, ({ request, locale }) => {
    event.request = request;

    return resolve(event, {
      transformPageChunk: ({ html }) => html.replace('lang="en"', `lang="${locale}"`)
    });
  });

export const handle: Handle = handleParaglide;

export const handleError = ({ error, event }) => {
  // eslint-disable-next-line no-console
  console.error('Server error:', error, 'at', event.url.pathname);
};
