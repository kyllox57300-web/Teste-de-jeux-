const name='derniere-sirene-v1';
const files=['./','./index.html','./game.js','./style.css'];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(name).then(cache=>cache.addAll(files)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('derniere-sirene-')&&key!==name).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  const scope=new URL(self.registration.scope);
  const url=new URL(event.request.url);
  if(event.request.method!=='GET'||url.origin!==scope.origin||!url.pathname.startsWith(scope.pathname)) return;
  event.respondWith(fetch(event.request).then(response=>{
    if(response.ok) {
      const copy=response.clone();
      caches.open(name).then(cache=>cache.put(event.request,copy));
    }
    return response;
  }).catch(async()=>{
    return await caches.match(event.request) || (event.request.mode==='navigate' ? await caches.match(new URL('./',scope)) : null) || Response.error();
  }));
});
