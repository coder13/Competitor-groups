self.addEventListener('push', (event) => {
  if (!event.data) {
    return;
  }

  const payload = event.data.json();
  const title = payload.title || 'Assignment update';
  const options = {
    body: payload.body,
    data: payload,
    tag: payload.dedupeKey || 'assignment-change',
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/settings';
  const url = new URL(targetUrl, self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then((clients) => {
      const existingClient = clients.find((client) => client.url === url);

      if (existingClient) {
        return existingClient.focus();
      }

      return self.clients.openWindow(url);
    }),
  );
});
