// Service worker for the daily push alert. Runs independently of any open tab —
// this is what lets the notification arrive even with the app fully closed.

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { title: 'Pag-IBIG watch', body: 'You have an update.' }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/favicon.svg',
      data: { url: data.url || '/' },
    }),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/'
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      const existing = clients.find((client) => client.url.includes(url))
      if (existing) return existing.focus()
      return self.clients.openWindow(url)
    }),
  )
})
