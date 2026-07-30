// Service worker minimal : suffisant pour satisfaire les critères d'installabilité PWA
// (Chrome/Edge exigent un service worker actif en plus du manifest), sans mise en cache
// agressive qui pourrait servir du contenu périmé sur une app qui affiche des données live.

const CACHE_NAME = "eljem-live-shell-v1";
const SHELL_ASSETS = ["/", "/manifest.json", "/logo-192.png", "/logo-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Réseau en priorité (les signalements sont en temps réel) ; le cache ne sert
// que de secours hors-ligne pour la coquille de l'app.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
