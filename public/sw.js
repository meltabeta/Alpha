const CACHE_NAME = 'kh-donghua-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';

// Add versioning to cache names
const CURRENT_CACHES = {
  static: STATIC_CACHE,
  dynamic: DYNAMIC_CACHE
};

const urlsToCache = [
  '/',
  '/index.html',
  '/src/main.jsx',
  '/src/App.css',
  '/manifest.json',
  '/assets/images/logo.png',
  '/assets/images/banner.jpg',
  '/assets/images/logo-192.png',
  '/assets/images/logo-512.png',
  '/assets/images/splash.png'
];

// Optimize cache strategy
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.addAll(urlsToCache);
      }),
      self.skipWaiting() // Ensure new service worker takes over immediately
    ])
  );
});

// Implement stale-while-revalidate strategy
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          // Don't cache if not successful response
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }

          // Clone the response
          const responseToCache = networkResponse.clone();

          // Cache the new response
          caches.open(DYNAMIC_CACHE)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return networkResponse;
        })
        .catch(() => {
          // Return cached response if network fails
          return cachedResponse;
        });

      return cachedResponse || fetchPromise;
    })
  );
});

// Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Remove old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!Object.values(CURRENT_CACHES).includes(cacheName)) {
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Ensure new service worker takes control immediately
      self.clients.claim()
    ])
  );
});

// Handle push notifications
self.addEventListener('push', (event) => {
  if (event.data) {
    const options = {
      body: event.data.text(),
      icon: '/assets/images/logo-192.png',
      badge: '/assets/images/logo-192.png'
    };

    event.waitUntil(
      self.registration.showNotification('KH-DONGHUA', options)
    );
  }
}); 