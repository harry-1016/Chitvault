const CACHE='chitvault-v1';
self.addEventListener('install',e=>{self.skipWaiting();});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch',e=>{
  if(e.request.url.includes('googleapis.com')){
    e.respondWith(fetch(e.request).catch(()=>new Response('{"error":"offline"}')));
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached=>{
      if(cached)return cached;
      return fetch(e.request).then(res=>{
        if(res.ok&&e.request.method==='GET'){
          const clone=res.clone();
          caches.open(CACHE).then(c=>c.put(e.request,clone));
        }
        return res;
      }).catch(()=>e.request.mode==='navigate'?caches.match('index.html'):undefined);
    })
  );
});
