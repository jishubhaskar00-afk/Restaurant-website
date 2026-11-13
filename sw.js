const CACHE_NAME = 'ja-restaurant-cache-v1';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/order.html',
    '/dashboard.html',
    '/style.css',
    '/order_style.css',
    '/dashboard_style.css',
    '/app_bridge.js',
    '/manifest.json',
    '/images/logo1.png',
    '/images/bg.png',
    '/images/plate.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(STATIC_ASSETS).catch(err => {
                console.warn('Some assets could not be cached during SW install:', err);
            });
        }).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    // Only handle GET requests and non-API paths for cache
    if (event.request.method !== 'GET' || event.request.url.includes('/api/')) {
        return;
    }

    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) {
                // Fetch in background to update cache
                fetch(event.request).then(networkResponse => {
                    if (networkResponse && networkResponse.status === 200) {
                        caches.open(CACHE_NAME).then(cache => cache.put(event.request, networkResponse.clone()));
                    }
                }).catch(() => { });
                return cachedResponse;
            }
            return fetch(event.request).catch(() => {
                // Return offline fallback if html is requested
                if (event.request.headers.get('accept').includes('text/html')) {
                    return caches.match('/index.html');
                }
            });
        })
    );
});
