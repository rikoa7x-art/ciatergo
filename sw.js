const CACHE_NAME = 'otwkeun-v11';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './driver.html',
  './merchant.html',
  './admin.html',
  './manifest.json',
  './shared-sync.js',
  './supabase-config.js',
  './icon.svg'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Never intercept or cache Supabase API/Realtime, WebSockets, or OSM Nominatim
  if (
    event.request.url.includes('supabase.co') ||
    event.request.url.includes('nominatim.openstreetmap.org') ||
    event.request.url.startsWith('ws://') ||
    event.request.url.startsWith('wss://')
  ) {
    return;
  }

  const isHtml = event.request.headers.get('accept')?.includes('text/html');

  if (isHtml || event.request.mode === 'navigate') {
    // Network-First strategy for HTML navigation (always get fresh version)
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          return networkResponse;
        })
        .catch(() => caches.match(event.request).then(cached => cached || caches.match('./index.html')))
    );
    return;
  }

  // Cache-First with Network fallback for static assets
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        if (event.request.url.startsWith('http') && event.request.method === 'GET') {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        }
        return networkResponse;
      });
    })
  );
});
