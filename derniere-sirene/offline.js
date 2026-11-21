const name='derniere-sirene-v3';
const files=['./','./index.html','./game.js','./style.css','./signal.png'];
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
  const fresh=fetch(event.request);
  event.waitUntil(fresh.then(async response=>{
    if(response.ok) {
      const copy=response.clone();
      const cache=await caches.open(name);
      await cache.put(event.request,copy);
    }
  }).catch(()=>{}));
  event.respondWith(fresh.catch(async()=>{
    return await caches.match(event.request) || (event.request.mode==='navigate' ? await caches.match(new URL('./',scope)) : null) || Response.error();
  }));
});
