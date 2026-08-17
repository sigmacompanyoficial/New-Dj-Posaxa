"use client";

import { useEffect } from "react";
import { getMessaging, onMessage, getToken } from "firebase/messaging";
import { app } from "@/lib/firebase";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

export default function NotificationManager() {
  const { user } = useAuth();

  // Register FCM token and save to Supabase when user logs in
  useEffect(() => {
    if (!user) return;

    const setupNotifications = async () => {
      try {
        if (typeof window === "undefined" || !("Notification" in window) || !("serviceWorker" in navigator)) return;

        const permission = await Notification.requestPermission();
        if (permission !== "granted") return;

        const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
        if (!vapidKey || vapidKey.length < 80) return;

        // Register SW if not already registered
        let registration = await navigator.serviceWorker.getRegistration("/firebase-messaging-sw.js");
        if (!registration) {
          registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js", { scope: "/" });
        }
        const activeReg = await navigator.serviceWorker.ready;

        const messaging = getMessaging(app);
        const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: activeReg });
        if (!token) return;

        // Save token to Supabase
        const { error } = await supabase.from("user_fcm_tokens").upsert(
          { user_id: user.id, token, updated_at: new Date().toISOString() },
          { onConflict: "user_id" }
        );
        if (error) {
          console.error("Error guardant token FCM:", error.message);
        }
      } catch (err) {
        console.warn("Error en setupNotifications:", err);
      }
    };

    setupNotifications();
  }, [user]);

  // Persistent foreground message listener — shows notification when app is open
  useEffect(() => {
    if (typeof window === "undefined") return;

    let unsubscribe: (() => void) | null = null;

    const attachListener = () => {
      try {
        const messaging = getMessaging(app);
        unsubscribe = onMessage(messaging, (payload) => {
          if (!payload?.notification) return;

          const { title, body } = payload.notification;
          const url = (payload.data?.url as string) || "/";

          if (Notification.permission === "granted" && title) {
            const n = new Notification(title, {
              body: body || "",
              icon: "/Fotos/dj-posaxa-logo.png",
              badge: "/favicon.png",
              tag: "dj-posaxa-notification",
            });
            n.onclick = () => {
              window.focus();
              window.location.href = url;
              n.close();
            };
          }
        });
      } catch (err) {
        console.warn("Error en attachListener notificacions:", err);
      }
    };

    attachListener();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return null;
}
