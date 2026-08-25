const CACHE_NAME = 'otwkeun-v2';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './driver.html',
  './merchant.html',
  './admin.html',
  './manifest.json',
  './shared-sync.js',
  './icon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
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
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        // Dynamically cache external CDN assets (Tailwind, Leaflet, etc.)
        if (event.request.url.startsWith('http') && event.request.method === 'GET') {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        }
        return networkResponse;
      }).catch(() => {
        // Fallback for HTML navigation if offline
        const accept = event.request.headers.get('accept');
        if (accept && accept.includes('text/html')) {
          const url = new URL(event.request.url);
          if (url.pathname.includes('driver')) return caches.match('./driver.html');
          if (url.pathname.includes('merchant')) return caches.match('./merchant.html');
          if (url.pathname.includes('admin')) return caches.match('./admin.html');
          return caches.match('./index.html');
        }
      });
    })
  );
});
