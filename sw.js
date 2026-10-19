const CACHE='aether-clash-v455';
const ASSETS=['./','./index.html','./style.css','./v100.css','./v142.css','./v325.css','./v337.css','./v343.css','./v380.css','./v383.css','./v384.css','./v455.css','./v386.css','./v388.css','./v391.css','./v392.css','./v396.css','./js/00-boot-network-tutorial.js','./js/01-world-modes-state.js','./js/02-profile-saves.js','./js/03-achievements-daily-history.js','./js/04-audio-feedback-input.js','./js/05-shop-pause-spells.js','./js/06-heroes-runes.js','./js/07-menu-controls.js','./js/08-talents-director-structures.js','./js/09-combat-skills.js','./js/10-match-flow-ai.js','./js/11-mode-systems.js','./js/12-update-vision-map.js','./js/13-character-render.js','./js/14-entities-hud-render.js','./js/14b-visual-polish.js','./js/14c-gl3d.js','./js/14d-gl3d-models.js','./js/15-boot.js','./js/16-quickstart.js','./manifest.webmanifest','./icon.svg','./icon-192.png','./icon-512.png','./assets/aether-rift-map.webp','./assets/guardian.webp','./assets/phantom.webp','./assets/oracle.webp','./assets/tempest.webp','./assets/seraph.webp','./assets/archon.webp','./assets/warden.webp','./assets/forgeborn.webp','./assets/lumen.webp'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  event.respondWith(fetch(event.request).then(response=>{
    if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy))}
    return response;
  }).catch(()=>caches.match(event.request).then(cached=>cached||caches.match('./index.html'))));
});
