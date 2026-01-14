const CACHE_NAME = "reading-journal-v3";

// Lista de arquivos que queremos deixar disponíveis offline
const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/livros.html",
  "/challenge.html",
  "/calendario.html",
  "/bingo.html",
  "/cores.html",
  "/favoritos.html",
  "/a-z.html",
  "/css/style.css",
  "/js/app.js",
  "/manifest.json",
  "/icons/icon-72.png",
  "/icons/icon-96.png",
  "/icons/icon-128.png",
  "/icons/icon-144.png",
  "/icons/icon-152.png",
  "/icons/icon-192.png",
  "/icons/icon-384.png",
  "/icons/icon-512.png",
  "/screenshots/screen1.png",
  "/offline.html" // Página de fallback offline
];

// INSTALAÇÃO: salva arquivos no cache
self.addEventListener("install", event => {
  console.log("[SW] Instalando e cacheando arquivos...");
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(FILES_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

// ATIVAÇÃO: limpa caches antigos
self.addEventListener("activate", event => {
  console.log("[SW] Ativando e limpando caches antigos...");
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// FETCH: intercepta requisições
self.addEventListener("fetch", event => {
  const req = event.request;

  // Sempre tenta pegar HTML da rede, se falhar usa offline
  if (req.headers.get("accept")?.includes("text/html")) {
    event.respondWith(
      fetch(req).catch(() => caches.match("/offline.html"))
    );
    return;
  }

  // Para outros arquivos: cache first
  event.respondWith(
    caches.match(req).then(cached => {
      return cached || fetch(req).then(networkRes => {
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(req, networkRes.clone());
          return networkRes;
        });
      });
    })
  );
});
