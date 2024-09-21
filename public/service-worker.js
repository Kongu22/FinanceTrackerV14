// public/service-worker.js

self.addEventListener('push', function (event) {
    const options = {
      body: event.data ? event.data.text() : 'Time to check your Finance Tracker!',
      icon: '/public/logoCoin.jpg', // Replace with your icon
      badge: '/badge.png', // Replace with your badge icon
    };
  
    event.waitUntil(
      self.registration.showNotification('Finance Tracker Notification', options)
    );
  });
  
  self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    event.waitUntil(
      clients.openWindow('/').then(function (windowClient) {
        if (windowClient) windowClient.focus();
      })
    );
  });
  