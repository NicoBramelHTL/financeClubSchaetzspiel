// Cacht alle Spieldateien, damit das Spiel am Stand auch ohne WLAN läuft.
// Nach Änderungen an Dateien die Versionsnummer erhöhen.
const CACHE = "schaetz-das-geld-v3";
const FILES = [
  "./",
  "index.html",
  "css/style.css",
  "js/questions.js",
  "js/game.js",
  "assets/icon.svg",
  "manifest.webmanifest",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Cache first; Google Fonts werden beim ersten Laden mitgecacht
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then((hit) => hit || fetch(e.request).then((res) => {
      const url = new URL(e.request.url);
      if (res.ok && (url.origin === location.origin || url.host.endsWith("fonts.googleapis.com") || url.host.endsWith("fonts.gstatic.com"))) {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
      }
      return res;
    }))
  );
});
