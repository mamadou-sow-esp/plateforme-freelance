// Service worker - Alicia PWA
// Bump CACHE_VERSION whenever the caching strategy changes to force old caches to clear.
const CACHE_VERSION = 'v3'
const CACHE_NAME = `alicia-cache-${CACHE_VERSION}`

const APP_SHELL = [
  '/',
  '/manifest.webmanifest',
  '/favicon.ico',
  '/favicon-32.png',
]

// Never cache API / realtime calls (Supabase) - always go to network.
const isApiRequest = (url) =>
  url.hostname.endsWith('supabase.co') ||
  url.hostname.endsWith('supabase.in') ||
  url.pathname.startsWith('/rest/') ||
  url.pathname.startsWith('/auth/') ||
  url.pathname.startsWith('/storage/')

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).catch(() => {})
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  )
  self.clients.claim()
})

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin && !isApiRequest(url)) {
    // Third-party asset (fonts, cdn) - let the browser handle it, don't intercept.
    return
  }
  if (isApiRequest(url)) return // never intercept Supabase calls

  // Navigation requests: network-first so users always get the latest app shell,
  // falling back to the cached shell when offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put('/', copy))
          return response
        })
        .catch(() => caches.match('/'))
    )
    return
  }

  // Static assets (JS/CSS/images/fonts built by Vite): cache-first, refresh in background.
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
          }
          return response
        })
        .catch(() => cached)
      return cached || network
    })
  )
})
