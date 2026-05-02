import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, Messaging, onMessage, getToken } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

let messaging: Messaging | undefined;

if (typeof window !== "undefined") {
  messaging = getMessaging(app);
}

export { app, messaging };

export const requestForToken = async () => {
  if (!messaging || typeof window === "undefined") return null;
  if (!("Notification" in window) || !("serviceWorker" in navigator)) {
    console.warn("Aquest navegador no suporta notificacions push web.");
    return null;
  }

  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
  if (!vapidKey) {
    console.warn("Falta NEXT_PUBLIC_FIREBASE_VAPID_KEY al .env.local.");
    return null;
  }
  if (vapidKey.length < 80) {
    console.warn(
      "NEXT_PUBLIC_FIREBASE_VAPID_KEY parece demasiado corta. Firebase Web necesita la clave publica de Web Push certificates, no la privada."
    );
    return null;
  }
  
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("Permis de notificacions denegat o pendent.");
      return null;
    }

    // Registro manual del Service Worker para mayor estabilidad en Next.js
    const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
    
    const currentToken = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration
    });

    if (currentToken) {
      return currentToken;
    } else {
      console.warn("No se pudo obtener el token FCM (permiso denegado o error).");
      return null;
    }
  } catch (err) {
    console.error("Error al registrar Service Worker o obtener token:", err);
    return null;
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    if (!messaging) return;
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
