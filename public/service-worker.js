
// Cache names
const STATIC_CACHE = 'mingle-static-v1';
const DYNAMIC_CACHE = 'mingle-dynamic-v1';
const ASSETS_CACHE = 'mingle-assets-v1';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/assets/icons/offline-icon.png'
];

// Install event
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        return cache.addAll(STATIC_ASSETS);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => 
            cacheName.startsWith('mingle-') && 
            cacheName !== STATIC_CACHE &&
            cacheName !== DYNAMIC_CACHE &&
            cacheName !== ASSETS_CACHE
          )
          .map(cacheName => caches.delete(cacheName))
      );
    })
    .then(() => clients.claim())
  );
});

// Fetch event with improved offline handling
self.addEventListener('fetch', event => {
  // For API requests, try network first, then cache
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Clone the response and store it in cache
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE)
            .then(cache => {
              cache.put(event.request, responseClone);
            });
          return response;
        })
        .catch(() => {
          // Return cached version if available
          return caches.match(event.request)
            .then(cachedResponse => {
              if (cachedResponse) {
                // Add an offline flag to the headers to indicate stale data
                const headers = new Headers(cachedResponse.headers);
                headers.append('X-Offline', 'true');
                
                // Create a new response with the offline flag
                return new Response(cachedResponse.body, {
                  status: cachedResponse.status,
                  statusText: cachedResponse.statusText + ' (offline)',
                  headers
                });
              }
              
              // Return a generic offline response if nothing in cache
              return new Response(JSON.stringify({
                error: 'You are offline',
                offline: true,
                timestamp: new Date().toISOString()
              }), {
                status: 503,
                headers: { 'Content-Type': 'application/json' }
              });
            });
        })
    );
    return;
  }

  // For assets like images, use cache first approach
  if (
    event.request.destination === 'image' || 
    event.request.url.includes('/assets/')
  ) {
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          return fetch(event.request)
            .then(response => {
              const responseClone = response.clone();
              caches.open(ASSETS_CACHE)
                .then(cache => {
                  cache.put(event.request, responseClone);
                });
              return response;
            })
            .catch(error => {
              // Return a fallback image for offline scenarios
              if (event.request.destination === 'image') {
                return caches.match('/assets/icons/offline-icon.png');
              }
              console.error('Fetch error:', error);
              throw error;
            });
        })
    );
    return;
  }

  // For everything else, try cache first, then network with improved offline handling
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request)
          .then(response => {
            // Don't cache non-success responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE)
              .then(cache => {
                cache.put(event.request, responseClone);
              });
            return response;
          })
          .catch(() => {
            // If offline and not in cache, show offline page
            if (event.request.mode === 'navigate') {
              return caches.match('/offline.html');
            }
            
            // For other requests, return a generic error
            throw new Error('Network error while offline');
          });
      })
  );
});

// Listen for messages from the client
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Broadcast offline/online status changes to clients
self.addEventListener('fetch', event => {
  const online = self.navigator ? self.navigator.onLine : true;
  
  // Only broadcast status changes to avoid flooding
  if (event.request.mode === 'navigate' && event.request.method === 'GET') {
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'NETWORK_STATUS',
          payload: { online }
        });
      });
    });
  }
});

// The rest will be auto-generated by Workbox during build
