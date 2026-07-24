/**
 * Hand-rolled, deliberately small -- no Workbox/next-pwa dependency, so it
 * costs nothing against the Phase 8 <200KB calculator-route JS budget
 * (this file is fetched by the browser's SW machinery, never bundled into
 * a route's JS). Registered from components/ServiceWorkerRegistration.tsx.
 *
 * Strategy: network-first, cache-fallback, runtime-populated -- there's no
 * build-time precache list here (Next.js's hashed chunk filenames change
 * every build, so a static list would go stale). The first online visit
 * to any same-origin GET URL (the calculator route, its JS/CSS chunks)
 * populates the cache; a later offline visit serves from it instead of
 * failing. Cross-origin requests (Firestore, Firebase Auth) are never
 * intercepted -- "the learner's saved results work offline" is handled
 * separately by Firestore's own IndexedDB persistence (see
 * lib/firebase/client.ts), not by this service worker, since a generic
 * fetch handler has no business proxying Firestore's real-time protocol.
 */

const CACHE_NAME = "ucag-shell-v1";
const APP_SHELL_URL = "/";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.add(APP_SHELL_URL))
      .catch(() => {
        // Offline on first install (shouldn't happen in practice) --
        // fetch handler below still works once anything gets cached later.
      })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      try {
        const response = await fetch(request);
        if (response.ok) cache.put(request, response.clone());
        return response;
      } catch {
        const cached = await cache.match(request);
        if (cached) return cached;
        if (request.mode === "navigate") {
          const shell = await cache.match(APP_SHELL_URL);
          if (shell) return shell;
        }
        throw new Error("Offline and not yet cached for this URL.");
      }
    })
  );
});
