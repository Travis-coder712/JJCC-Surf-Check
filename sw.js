const CACHE_NAME = 'surf-check-v14';
const STATIC_ASSETS = [
  '/JJCC-Surf-Check/',
  '/JJCC-Surf-Check/index.html',
  '/JJCC-Surf-Check/style.css',
  '/JJCC-Surf-Check/app.js',
  '/JJCC-Surf-Check/manifest.json',
];

// Install — cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Listen for skip waiting message from app
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Fetch — network first for static (to detect updates), cache fallback for offline
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // API calls: network first, fallback to cache
  if (url.hostname.includes('open-meteo.com')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Static assets: network first so updates are picked up, cache fallback for offline
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
