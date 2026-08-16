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
      "NEXT_PUBLIC_FIREBASE_VAPID_KEY és massa curta. Necessites la clau pública de Web Push certificates de Firebase Console."
    );
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("Permís de notificacions denegat o pendent.");
      return null;
    }

    // Get existing SW or register a new one
    let registration = await navigator.serviceWorker.getRegistration("/firebase-messaging-sw.js");
    if (!registration) {
      registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js", {
        scope: "/",
      });
    }

    // Wait until SW is fully active before getting FCM token.
    // This prevents the "Registration failed - push service not available" / AbortError.
    if (registration.installing || registration.waiting) {
      await new Promise<void>((resolve) => {
        const sw = registration!.installing || registration!.waiting;
        if (!sw) return resolve();
        sw.addEventListener("statechange", function onStateChange() {
          if (sw.state === "activated") {
            sw.removeEventListener("statechange", onStateChange);
            resolve();
          }
        });
        setTimeout(resolve, 5000); // safety timeout
      });
    }

    // navigator.serviceWorker.ready resolves to the active registration
    const activeReg = await navigator.serviceWorker.ready;

    const currentToken = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: activeReg,
    });

    if (currentToken) {
      return currentToken;
    } else {
      console.warn("No s'ha pogut obtenir el token FCM (pot ser VAPID key incorrecta o permís denegat).");
      return null;
    }
  } catch (err: any) {
    if (err?.name === "AbortError" || err?.message?.includes("push service")) {
      // Silently ignore — happens in HTTP (local dev), some VPNs, or strict browser policies.
      // In-app alerts (banner) still work without FCM.
      console.warn("Push service no disponible en aquest entorn. Les notificacions in-app seguiran funcionant.");
    } else {
      console.error("Error al registrar Service Worker o obtenir token FCM:", err);
    }
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
