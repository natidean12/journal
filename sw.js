const CACHE_NAME = "reading-journal-v3";

// Lista atualizada com o seu arquivo "capas.png"
const FILES_TO_CACHE = [
  "./",
  "./livros.html",
  "./roleta.html", // Adicionei a roleta que criamos!
  "./manifest.json",
  "./icons/capas.png", // Seu arquivo de ícone renomeado
  "./offline.html" 
];

// INSTALAÇÃO
self.addEventListener("install", event => {
  console.log("[SW] Instalando e cacheando arquivos...");
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        // Usamos um loop para não travar se um arquivo faltar
        return Promise.allSettled(
          FILES_TO_CACHE.map(url => cache.add(url))
        );
      })
      .then(() => self.skipWaiting())
  );
});

// ATIVAÇÃO
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// FETCH (Busca de arquivos)
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // Retorna do cache se tiver, senão busca na rede
      return response || fetch(event.request);
    })
  );
});