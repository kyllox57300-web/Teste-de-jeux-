// Brumeterre — service worker : le jeu marche sans internet
const NAME = 'brumeterre-v1';
const FILES = ['./', './index.html', './style.css', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png', './icons/apple-touch-icon.png',
  './js/util.js', './js/lang.js', './js/data_powers.js', './js/data_world.js', './js/data_meta.js', './js/engine.js', './js/weapons.js', './js/run.js', './js/meta.js',
  './js/gfx.js', './js/render.js', './js/village.js', './js/audio.js', './js/ui.js', './js/screens.js', './js/screens2.js', './js/main.js'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(NAME).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('brumeterre-') && k !== NAME).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Réseau d'abord (pour recevoir les mises à jour), cache si hors ligne
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(r => {
    if (r.ok) { const copy = r.clone(); caches.open(NAME).then(c => c.put(e.request, copy)); }
    return r;
  }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || (e.request.mode === 'navigate' ? caches.match('./index.html') : Response.error()))));
});
