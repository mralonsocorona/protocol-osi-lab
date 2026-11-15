/* Generated cache lists and version are inserted during the production build. */
const CACHE_PREFIX = "blacknova-bases-shell-";
const CACHE_NAME = CACHE_PREFIX + "dev";
const PRECACHE_URLS = [];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  if (request.mode === "navigate" && url.pathname.startsWith("/bases/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) void caches.open(CACHE_NAME).then((cache) => cache.put("/bases/", response.clone()));
          return response;
        })
        .catch(async () => {
          const cache = await caches.open(CACHE_NAME);
          return (await cache.match(request)) || (await cache.match("/bases/")) || Response.error();
        }),
    );
    return;
  }

  if (url.pathname.startsWith("/capas/assets/") || url.pathname.startsWith("/bases/icons/") || url.pathname === "/bases/manifest.webmanifest") {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => cache.match(request).then((cached) => cached || fetch(request).then((response) => {
        if (response.ok) void cache.put(request, response.clone());
        return response;
      }))),
    );
  }
});
