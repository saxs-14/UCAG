/**
 * Mpumi Service Worker for Offline PWA Operations
 * Caches core layout styles, icons, fonts, and assets for rural off-grid support.
 */

const CACHE_NAME = 'mpumi-ucag-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/App.tsx',
  '/src/index.css',
  '/src/config/firebase.ts',
  '/src/config/mongodb.ts',
  '/src/components/Navigation.tsx',
  '/src/components/APSCalculator.tsx',
  '/src/components/MentorshipPortal.tsx',
  '/src/components/CareerSimulator.tsx',
  '/src/components/SuccessAnalytics.tsx',
  '/src/components/SchoolAnalytics.tsx',
  '/src/components/AIChatbot.tsx',
];

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('⚡ Mpumi Service Worker: Caching critical assets for off-grid operation');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('🧹 Mpumi Service Worker: Clearing obsolete caches');
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Interception
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse; // Return cached asset if offline
        }
        return fetch(event.request).catch(() => {
          // If network fails and request is for page, return offline fallbacks if needed
          console.log('📶 Mpumi offline fetch fallback active');
        });
      })
  );
});
