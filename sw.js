const CACHE_NAME = 'jinasaraswati-v1';
const urlsToCache = [
  '/JinaSaraswati/',
  '/JinaSaraswati/index.html',
  '/JinaSaraswati/css/main.css',
  '/JinaSaraswati/js/app.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
