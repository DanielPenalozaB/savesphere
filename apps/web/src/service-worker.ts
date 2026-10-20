/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />
import { version } from '$app/env';
import { assets, immutable } from '$app/manifest';

const sw = self as unknown as ServiceWorkerGlobalScope;
const CACHE = `savesphere-${version}`;
// App shell: built JS/CSS plus static files (icons, manifest), as absolute pathnames.
const ASSETS = [...immutable, ...assets].map(
	({ path }) => new URL(path, sw.location.origin + '/').pathname
);

sw.addEventListener('install', (event) => {
	event.waitUntil(
		caches
			.open(CACHE)
			.then((cache) => cache.addAll(ASSETS))
			.then(() => sw.skipWaiting())
	);
});

sw.addEventListener('activate', (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((keys) =>
				Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))
			)
			.then(() => sw.clients.claim())
	);
});

sw.addEventListener('fetch', (event) => {
	const url = new URL(event.request.url);
	// Never cache API calls or non-GET requests: financial data must always be fresh.
	if (
		event.request.method !== 'GET' ||
		url.origin !== sw.location.origin ||
		url.pathname.startsWith('/api/')
	) {
		return;
	}

	if (ASSETS.includes(url.pathname)) {
		event.respondWith(caches.match(url.pathname).then((cached) => cached ?? fetch(event.request)));
		return;
	}

	// Pages: network first, fall back to the cached copy when offline.
	event.respondWith(
		fetch(event.request)
			.then((response) => {
				if (response.ok) {
					const copy = response.clone();
					caches.open(CACHE).then((cache) => cache.put(event.request, copy));
				}
				return response;
			})
			.catch(async () => (await caches.match(event.request)) ?? Response.error())
	);
});
