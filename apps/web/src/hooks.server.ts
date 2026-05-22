import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  // Read auth token from cookie for SSR context
  const token = event.cookies.get('access_token');

  if (token) {
    try {
      // We can't verify the JWT here without the secret,
      // but we can attach the token for downstream use if needed.
      // In a full SSR setup, you'd validate against the backend
      // or share the JWT secret with the frontend server.
      event.locals.token = token;
    } catch {
      // Invalid token
    }
  }

  return resolve(event);
};
