// HippoLink 推播接收程式（service worker）
// 放在和 index.html 同一個資料夾

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

// 收到推播：只顯示一行提醒，不含公告內容
self.addEventListener('push', (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (_) { d = {}; }
  const title = d.title || 'HippoLink';
  const body = d.body || '你有一則新的訊息';
  e.waitUntil(self.registration.showNotification(title, {
    body,
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    tag: d.tag || 'hippolink',
    renotify: true,
    data: { url: d.url || './' },
  }));
});

// 點通知：打開網站（已經開著就切過去）
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const url = new URL((e.notification.data && e.notification.data.url) || './', self.registration.scope).href;
  e.waitUntil((async () => {
    const list = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of list) {
      if (c.url.startsWith(self.registration.scope) && 'focus' in c) return c.focus();
    }
    return self.clients.openWindow(url);
  })());
});
