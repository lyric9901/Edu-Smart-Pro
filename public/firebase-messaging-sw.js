// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyA3NvkpyNYJhHELx6nVparn5I-pcTeeOsE",
  authDomain: "tutionmanagement-1.firebaseapp.com",
  projectId: "tutionmanagement-1",
  storageBucket: "tutionmanagement-1.firebasestorage.app",
  messagingSenderId: "329592120597",
  appId: "1:329592120597:web:a54c5c0ea72a8ef5d9751c"
};

try {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    const title = payload.notification?.title || payload.data?.title || 'Attendance Alert';
    const body = payload.notification?.body || payload.data?.body || 'New alert from EduSmart Pro';
    const targetUrl = payload.data?.url || payload.fcmOptions?.link || '/dashboard/attendance';

    const notificationOptions = {
      body: body,
      icon: payload.notification?.icon || payload.data?.icon || '/icons/icon-192x192.png',
      badge: payload.notification?.badge || payload.data?.badge || '/icons/icon-72x72.png',
      data: {
        url: targetUrl
      },
      tag: payload.data?.tag || 'attendance-alert',
      renotify: true
    };

    return self.registration.showNotification(title, notificationOptions);
  });
} catch (err) {
  console.warn('[firebase-messaging-sw.js] Messaging init warning:', err);
}

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/dashboard/attendance';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
