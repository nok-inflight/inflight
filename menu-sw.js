// Nok Air Sky Menu · ให้หน้าเมนูผู้โดยสาร (เล่มเมนู) เปิดได้ตอนไม่มีอินเทอร์เน็ต
// วางไฟล์นี้ไว้โฟลเดอร์เดียวกับ menu.html (รูปทุกหน้าฝังอยู่ใน menu.html แล้ว ไม่ต้องมีไฟล์รูปแยก)
const CACHE = 'skymenu-v3';
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.add('./menu.html').catch(() => null)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.indexOf('skymenu') === 0 && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (!/menu\.html$/.test(url.pathname)) return;
  // หน้าเมนู: ใช้ของใหม่จากเน็ตก่อน ถ้าไม่มีเน็ตใช้ที่เก็บไว้
  e.respondWith(fetch(req).then(r => { const c = r.clone(); caches.open(CACHE).then(x => x.put('./menu.html', c)); return r; })
    .catch(() => caches.match('./menu.html')));
});
