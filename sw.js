/* Service worker: guarda os arquivos do próprio site para abrir rápido e funcionar com sinal fraco.
   Só arquivos do mesmo endereço; nada do Firebase ou de outros sites é guardado. */
const CACHE = "expedicoes-v5";
const FILES = ["./", "index.html", "styles.css", "config.js", "db.js", "pets.js", "app.js",
  "vendor/three-locar.js", "vendor/qrcode.js", "vendor/leaflet/leaflet.js", "vendor/leaflet/leaflet.css", "manifest.webmanifest",
  "assets/models/surucua.glb", "assets/surucua.png", "assets/audio/canto.mp3", "assets/tag.png", "assets/chocolatissimo.jpg", "assets/icon-192.png", "assets/icon-512.png",
  "assets/medal-level.png", "assets/medal-photo.png", "assets/medal-trophy.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return;
  // Rede primeiro (pega atualizações), cache como reserva.
  e.respondWith(fetch(e.request).then(r => {
    if (r.ok && r.type === "basic") { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
    return r;
  }).catch(() => caches.match(e.request).then(r => r || caches.match("index.html"))));
});
