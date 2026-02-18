const CACHE_NAME = 'note-organizer-v2' // Bumping version to force update
const urlsToCache = [
    '/',
]

self.addEventListener('install', (event) => {
    self.skipWaiting(); // Force active immediately
})

self.addEventListener('fetch', (event) => {
    // Network First strategy
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request);
        })
    );
})

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName)
                    }
                })
            )
        })
    )
})
