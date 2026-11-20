// Cacht alle Spieldateien, damit das Spiel am Stand auch ohne WLAN läuft.
// Mit Internet wird immer die neueste Version geladen, ohne Internet die gespeicherte.
// Nach Änderungen an Dateien die Versionsnummer erhöhen.
const CACHE = "schaetz-das-geld-v5";
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

// Network first (max. 3 s), sonst Cache. Google Fonts werden mitgecacht.
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  const cacheable = url.origin === location.origin || url.host.endsWith("fonts.googleapis.com") || url.host.endsWith("fonts.gstatic.com");
  if (!cacheable) return;
  const fromNetwork = fetch(e.request).then((res) => {
    if (res.ok) {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(e.request, copy));
    }
    return res;
  });
  const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 3000));
  e.respondWith(
    Promise.race([fromNetwork, timeout]).catch(() =>
      caches.match(e.request).then((hit) => hit || fromNetwork)
    )
  );
});
