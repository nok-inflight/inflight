// Nok Air Sky Menu · ให้หน้าเมนูผู้โดยสาร (เล่มเมนู) เปิดได้ตอนไม่มีอินเทอร์เน็ต
// วางไฟล์นี้ไว้โฟลเดอร์เดียวกับ menu.html และ menu-p1.jpg ... menu-p8.jpg
const CACHE = 'skymenu-v2';
const PAGES = ['./menu.html', './menu-p1.jpg', './menu-p2.jpg', './menu-p3.jpg', './menu-p4.jpg', './menu-p5.jpg', './menu-p6.jpg', './menu-p7.jpg', './menu-p8.jpg'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(PAGES.map(u => c.add(u).catch(() => null)))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.indexOf('skymenu') === 0 && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (/menu-p\d\.jpg$/.test(url.pathname)) {
    // รูปหน้าเมนู: ใช้ที่เก็บไว้ก่อน (เร็วและออฟไลน์ได้) แล้วอัปเดตเบื้องหลัง
    e.respondWith(caches.match(req).then(hit => {
      const net = fetch(req).then(r => { if (r && r.ok) { const c = r.clone(); caches.open(CACHE).then(x => x.put(req, c)); } return r; }).catch(() => hit);
      return hit || net;
    }));
    return;
  }
  if (!/menu\.html$/.test(url.pathname)) return;
  // หน้าเมนู: ใช้ของใหม่จากเน็ตก่อน ถ้าไม่มีเน็ตใช้ที่เก็บไว้
  e.respondWith(fetch(req).then(r => { const c = r.clone(); caches.open(CACHE).then(x => x.put('./menu.html', c)); return r; })
    .catch(() => caches.match('./menu.html')));
});
