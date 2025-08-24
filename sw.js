// sw.js - Enhanced Service Worker for Complete Offline Support
const CACHE_NAME = 'jinasaraswati-v1.0.0';
const RUNTIME_CACHE = 'runtime-cache-v1';

// All assets to cache for offline use
const STATIC_ASSETS = [
  // Core files
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  
  // CSS files
  '/css/main.css',
  '/css/animations.css',
  '/css/themes.css',
  '/css/responsive.css',
  
  // JavaScript files
  '/js/app.js',
  '/js/router.js',
  '/js/storage.js',
  '/js/achievements.js',
  '/js/karma-visualizer.js',
  '/js/soul-avatar.js',
  '/js/universe-navigator.js',
  '/js/sw-register.js',
  
  // Data files
  '/data/daily-prashnas.json',
  '/data/achievements.json',
  
  // Universe files
  '/universes/dravyanuyog/config.json',
  '/universes/dravyanuyog/chapters/chapter-40.html',
  '/universes/dravyanuyog/chapters/chapter-42.html',
  
  // Google Fonts (download specific fonts)
  'https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@300;400;600;700&display=swap',
  'https://fonts.gstatic.com/s/notosansdevanagari/v25/TuGoUUFzXI5FBtUq5a8bjKYTZjtRU6Sgv3NaV_SNmI0b8QQCQmHn6B2OHjbL_08AlXQly-AzoFoW4Ow.woff2'
];

// Install event - cache all static assets
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching static assets');
        
        // Cache files one by one to handle errors
        return Promise.allSettled(
          STATIC_ASSETS.map(url => {
            return cache.add(url).catch(err => {
              console.warn(`Failed to cache ${url}:`, err);
            });
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Static assets cached');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean old caches
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME && name !== RUNTIME_CACHE)
          .map(name => {
            console.log('Service Worker: Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      console.log('Service Worker: Activated');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip chrome extension requests
  if (event.request.url.includes('chrome-extension')) return;
  
  event.respondWith(
    // Try cache first for static assets
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          // Return cached version
          return cachedResponse;
        }
        
        // Not in cache, try network
        return fetch(event.request)
          .then(networkResponse => {
            // Check if valid response
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'opaque') {
              return networkResponse;
            }
            
            // Clone the response
            const responseToCache = networkResponse.clone();
            
            // Cache the fetched response for future use
            caches.open(RUNTIME_CACHE).then(cache => {
              // Only cache same-origin and CORS-enabled requests
              if (event.request.url.startsWith(self.location.origin) || 
                  event.request.url.includes('fonts.googleapis.com') ||
                  event.request.url.includes('fonts.gstatic.com')) {
                cache.put(event.request, responseToCache);
              }
            });
            
            return networkResponse;
          })
          .catch(() => {
            // Network failed, return offline page for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match('/offline.html');
            }
            
            // For other requests, try to return a cached version
            return caches.match(event.request);
          });
      })
      .catch(err => {
        console.error('Fetch failed:', err);
        // Return offline page as last resort
        return caches.match('/offline.html');
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', event => {
  console.log('Service Worker: Sync event', event.tag);
  
  if (event.tag === 'sync-progress') {
    event.waitUntil(syncUserProgress());
  }
});

async function syncUserProgress() {
  try {
    // Get all stored progress data
    const cache = await caches.open('user-data-cache');
    const requests = await cache.keys();
    
    for (const request of requests) {
      const response = await cache.match(request);
      const data = await response.json();
      
      // Try to sync with server (when you add backend)
      // For now, just log
      console.log('Syncing progress:', data);
      
      // Remove from cache after successful sync
      await cache.delete(request);
    }
    
    return true;
  } catch (error) {
    console.error('Sync failed:', error);
    return false;
  }
}

// Push notifications
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'आज का प्रश्न उपलब्ध है! Today\'s question is available!',
    icon: '/assets/icons/icon-192.png',
    badge: '/assets/icons/badge-72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'open',
        title: 'Open App'
      },
      {
        action: 'close',
        title: 'Close'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('जिनसरस्वती', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Cache management - periodic cleanup
self.addEventListener('message', event => {
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      })
    );
  }
  
  if (event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(RUNTIME_CACHE).then(cache => {
        return cache.addAll(event.data.urls);
      })
    );
  }
});

// Prefetch important resources
self.addEventListener('message', event => {
  if (event.data.type === 'PREFETCH') {
    event.waitUntil(
      caches.open(RUNTIME_CACHE).then(cache => {
        return Promise.all(
          event.data.urls.map(url => {
            return fetch(url).then(response => {
              return cache.put(url, response);
            }).catch(err => {
              console.warn('Prefetch failed for:', url, err);
            });
          })
        );
      })
    );
  }
});

console.log('Service Worker: Script loaded');
