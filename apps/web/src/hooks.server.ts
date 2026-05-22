import type { Handle } from '@sveltejs/kit';
import { paraglideMiddleware } from '$lib/paraglide/server.js';
import { sequence } from '@sveltejs/kit/hooks';

const apiProxyHandle: Handle = async ({ event, resolve }) => {
  if (event.url.pathname.startsWith('/api')) {
    const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:3000';
    const targetUrl = new URL(event.url.pathname + event.url.search, backendUrl);

    const headers = new Headers();
    event.request.headers.forEach((value, key) => {
      if (key.toLowerCase() !== 'host') {
        headers.set(key, value);
      }
    });

    try {
      const options: RequestInit = {
        method: event.request.method,
        headers
      };

      if (event.request.method !== 'GET' && event.request.method !== 'HEAD') {
        const bodyArrayBuffer = await event.request.arrayBuffer();
        if (bodyArrayBuffer.byteLength > 0) {
          options.body = bodyArrayBuffer;
          // Set duplex to 'half' to satisfy Node's fetch requirements when a body is present.
          (options as any).duplex = 'half';
        }
      }

      const response = await fetch(targetUrl.toString(), options);
      return response;
    } catch (err) {
      console.error('API Proxy Error:', err);
      return new Response(
        JSON.stringify({ error: 'API Proxy Gateway Error', details: String(err) }),
        {
          status: 502,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }

  return resolve(event);
};

const authHandle: Handle = async ({ event, resolve }) => {
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

const paraglideHandle: Handle = ({ event, resolve }) => {
  return paraglideMiddleware(event.request, ({ locale }) => {
    return resolve(event, {
      transformPageChunk: ({ html }) => html.replace('%lang%', locale)
    });
  });
};

export const handle: Handle = sequence(apiProxyHandle, authHandle, paraglideHandle);
