const CACHE='fitz-shell-v1';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('message',e=>{if(e.data?.type==='CACHE_SHELL')e.waitUntil(caches.open(CACHE).then(async c=>{await c.add('/');await Promise.allSettled((e.data.urls||[]).filter(u=>{try{return new URL(u).origin===location.origin;}catch{return false;}}).map(u=>c.add(u)));}).catch(()=>{}));});
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(u.origin!==location.origin||u.pathname.startsWith('/api/')||/signin|signout|callback/.test(u.pathname)||e.request.method!=='GET')return;
 if(e.request.mode==='navigate')e.respondWith(fetch(e.request).then(r=>{if(r.ok&&!r.redirected){const clone=r.clone();caches.open(CACHE).then(c=>c.put('/',clone)).catch(()=>{});}return r;}).catch(async()=>await caches.match('/')||new Response('Abre Fit Z con conexión una vez para activar el modo sin conexión.',{status:503,headers:{'Content-Type':'text/plain;charset=utf-8'}})));
 else if(/\.(js|css|svg|woff2?)$/.test(u.pathname))e.respondWith(caches.match(e.request).then(c=>c||fetch(e.request).then(r=>{if(r.ok){const clone=r.clone();caches.open(CACHE).then(c=>c.put(e.request,clone)).catch(()=>{});}return r;})));
});
