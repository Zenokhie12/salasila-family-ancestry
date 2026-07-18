/*
 * Cross-origin isolation service worker (web only).
 *
 * expo-sqlite's web backend needs SharedArrayBuffer, which browsers only
 * expose on cross-origin-isolated pages (COOP + COEP response headers).
 * Neither the Expo dev server nor typical static hosts send those headers,
 * so this worker re-serves every response with them injected — the standard
 * "coi-serviceworker" pattern. Registered by src/lib/crossOriginIsolation.ts,
 * which reloads the page once so the navigation itself goes through here.
 */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.cache === 'only-if-cached' && request.mode !== 'same-origin') return;

  event.respondWith(
    fetch(request).then((response) => {
      if (response.status === 0) return response;
      const headers = new Headers(response.headers);
      headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
      headers.set('Cross-Origin-Opener-Policy', 'same-origin');
      headers.set('Cross-Origin-Resource-Policy', 'cross-origin');
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    }),
  );
});
