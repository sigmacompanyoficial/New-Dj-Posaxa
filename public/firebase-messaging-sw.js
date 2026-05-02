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
  console.log("[firebase-messaging-sw.js] Received background message ", payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/favicon.ico", // Puedes poner un logo del DJ aquí
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
