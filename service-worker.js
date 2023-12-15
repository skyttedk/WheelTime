// For the sake of simplicity, we'll keep the service worker basic. It will cache your HTML, JS, and CSS files.
const CACHE_NAME = 'gps-logger-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/main.js',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
    .then(cache => cache.addAll(urlsToCache))
    .catch(error => {
      // This will give you more information on the error.
      console.error('Failed to cache assets:', error);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
    .then(response => response || fetch(event.request))
  );
});

// Additional background sync or push messages logic could go here in the future

self.addEventListener('periodicsync', event => {
  console.log('Sync event fired!', event);
  if (event.tag === 'gps-log-sync') {
    //event.waitUntil(logGPSPeriodically());

    event.waitUntil(logCurrentPosition());

  }
});

async function logGPSPeriodically() {
  // Perform your GPS logging logic here, similar to the logCurrentPosition function
  // ...
}