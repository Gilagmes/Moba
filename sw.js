const CACHE='aether-clash-v396';
const ASSETS=['./','./index.html','./style.css','./v100.css','./v142.css','./v325.css','./v337.css','./v343.css','./v380.css','./v383.css','./v384.css','./v386.css','./v388.css','./v391.css','./v392.css','./v396.css','./game.js','./manifest.webmanifest','./icon.svg','./icon-192.png','./icon-512.png','./assets/aether-rift-map.webp','./assets/guardian.webp','./assets/phantom.webp','./assets/oracle.webp','./assets/tempest.webp','./assets/seraph.webp','./assets/archon.webp','./assets/warden.webp','./assets/forgeborn.webp','./assets/lumen.webp'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  event.respondWith(fetch(event.request).then(response=>{
    if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy))}
    return response;
  }).catch(()=>caches.match(event.request).then(cached=>cached||caches.match('./index.html'))));
});
