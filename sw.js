// Retirement service worker: replace the old offline forecasting shell.
const CACHE = 'sendtemps-retired-v1';
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(['./', './index.html'])).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.endsWith('/') || url.pathname.endsWith('/index.html')) {
    event.respondWith(fetch(request, { cache: 'no-store' }).then(response => {
      if (response.ok) caches.open(CACHE).then(cache => cache.put('./index.html', response.clone())).catch(() => {});
      return response;
    }).catch(() => caches.match('./index.html')));
  }
});
