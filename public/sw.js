// Minimal push-only service worker. Not a full offline/PWA cache — its only
// job is to receive Web Push events while the site is closed or backgrounded
// and surface them via the OS notification center.

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('push', (event) => {
  if (!event.data) return

  let payload
  try {
    payload = event.data.json()
  } catch {
    payload = { title: 'TopDek', body: event.data.text() }
  }

  const { title, body, data } = payload

  event.waitUntil(
    self.registration.showNotification(title || 'TopDek', {
      body,
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      data,
      tag: data?.notificationId,
    }),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const url = event.notification.data?.url || '/'
  const targetUrl = new URL(url, self.location.origin).href

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus()
        }
      }
      for (const client of clientList) {
        if ('focus' in client && 'navigate' in client) {
          return client.focus().then(() => client.navigate(targetUrl))
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl)
      }
    }),
  )
})
