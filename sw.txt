// Inflight Operations · ให้หน้าเว็บเปิดได้ตอนไม่มีอินเทอร์เน็ต (วางไฟล์นี้ไว้โฟลเดอร์เดียวกับ index.html บน GitHub)
const CACHE = 'ifs-v1';
const CORE = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(CORE.map(u => c.add(u).catch(() => null)))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return; // การบันทึก/เรียกข้อมูลไป Apps Script ไม่ผ่านแคช
  const url = new URL(req.url);
  if (/script\.google(usercontent)?\.com$/.test(url.hostname)) return;
  // หน้าเว็บ: ใช้ของใหม่จากเน็ตก่อน (ได้เวอร์ชันล่าสุดเสมอ) ถ้าไม่มีเน็ตใช้ที่เก็บไว้
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(r => { const c = r.clone(); caches.open(CACHE).then(x => x.put('./index.html', c)); return r; })
      .catch(() => caches.match('./index.html').then(r => r || caches.match('./'))));
    return;
  }
  // ไลบรารี (Excel ฯลฯ) และรูป: ใช้ที่เก็บไว้ก่อน แล้วอัปเดตเบื้องหลัง
  e.respondWith(caches.match(req).then(hit => {
    const net = fetch(req).then(r => { if (r && (r.ok || r.type === 'opaque')) { const c = r.clone(); caches.open(CACHE).then(x => x.put(req, c)); } return r; }).catch(() => hit);
    return hit || net;
  }));
});
