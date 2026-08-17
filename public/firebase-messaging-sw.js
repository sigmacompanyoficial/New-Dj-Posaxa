importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

const firebaseConfig = {
  apiKey: "AIzaSyDGF_0Sr3UO3XNpYEI61CiPXduVF74blZI",
  authDomain: "dj-posaxa-7227f.firebaseapp.com",
  projectId: "dj-posaxa-7227f",
  storageBucket: "dj-posaxa-7227f.firebasestorage.app",
  messagingSenderId: "160669593516",
  appId: "1:160669593516:web:7043a7113e514977755409",
  measurementId: "G-H11NTMJ9EY"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Background message received:", payload);

  const title = payload.notification?.title || "DJ Posaxa";
  const body = payload.notification?.body || "";
  const url = payload.data?.url || "/";

  const notificationOptions = {
    body,
    icon: "/Fotos/dj-posaxa-logo.png",
    badge: "/favicon.png",
    tag: "dj-posaxa-notification",
    renotify: true,
    vibrate: [200, 100, 200],
    data: { url },
    actions: [
      { action: "open", title: "Veure" },
      { action: "close", title: "Tancar" }
    ]
  };

  self.registration.showNotification(title, notificationOptions);
});

// Handle notification click — open or focus the app
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "close") return;

  const url = event.notification.data?.url || "/";
  const fullUrl = self.location.origin + url;

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url === fullUrl && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(fullUrl);
      }
    })
  );
});
