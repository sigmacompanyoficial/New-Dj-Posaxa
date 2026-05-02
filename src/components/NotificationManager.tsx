"use client";

import { useEffect } from "react";
import { onMessageListener, requestForToken } from "@/lib/firebase";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

export default function NotificationManager() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const setupNotifications = async () => {
      const token = await requestForToken();
      if (!token) return;

      const { error } = await supabase.from("user_fcm_tokens").upsert(
        {
          user_id: user.id,
          token,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

      if (error) {
        console.error("Error guardant token FCM a Supabase:", error.message, error.details);
      }
    };

    setupNotifications();
  }, [user]);

  useEffect(() => {
    let active = true;

    onMessageListener()
      .then((payload: any) => {
        if (!active || !payload?.notification) return;

        if (Notification.permission === "granted") {
          new Notification(payload.notification.title, {
            body: payload.notification.body,
            icon: "/Fotos/dj-posaxa-logo.png",
          });
        }
      })
      .catch((err) => console.log("Error en el listener de notificacions:", err));

    return () => {
      active = false;
    };
  }, []);

  return null;
}
