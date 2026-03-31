// Moodie Service Worker
// Provides offline support and audio caching

const CACHE_NAME = 'moodie-v1';
const AUDIO_CACHE_NAME = 'moodie-audio-v1';

// Static assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/builder',
  '/manifest.json',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  // Activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== AUDIO_CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  // Take control of all pages immediately
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Handle audio files with cache-first strategy
  if (url.pathname.startsWith('/audio/')) {
    event.respondWith(
      caches.open(AUDIO_CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }

        try {
          const networkResponse = await fetch(event.request);
          // Cache successful audio responses
          if (networkResponse.ok) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        } catch (error) {
          // Return a silent audio response if offline and not cached
          return new Response(null, {
            status: 503,
            statusText: 'Audio not available offline',
          });
        }
      })
    );
    return;
  }

  // Handle navigation requests with network-first, fallback to cache
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache the latest version
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // Fallback to cached version
          return caches.match(event.request).then((cachedResponse) => {
            return cachedResponse || caches.match('/');
          });
        })
    );
    return;
  }

  // Default: network-first for other requests
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

// Message event - handle cache operations from the app
self.addEventListener('message', (event) => {
  if (event.data.type === 'CACHE_AUDIO') {
    const audioUrls = event.data.urls;
    caches.open(AUDIO_CACHE_NAME).then((cache) => {
      audioUrls.forEach((url) => {
        cache.add(url).catch((err) => {
          console.warn(`Failed to cache audio: ${url}`, err);
        });
      });
    });
  }

  if (event.data.type === 'CLEAR_AUDIO_CACHE') {
    caches.delete(AUDIO_CACHE_NAME);
  }
});
