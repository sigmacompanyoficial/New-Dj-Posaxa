"use client";

import { useEffect, useState } from "react";
import { requestForToken, onMessageListener } from "@/lib/firebase";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

export default function NotificationManager() {
  const { user } = useAuth();
  const [notification, setNotification] = useState({ title: "", body: "" });

  useEffect(() => {
    if (user) {
      // Pedir permiso y obtener token al loguearse
      const setupNotifications = async () => {
        const token = await requestForToken();
        if (token) {
          // Guardar el token en la base de datos vinculado al usuario
          // Usamos Supabase para guardar el token en una tabla de perfiles o similar
          const { error } = await supabase
            .from("user_fcm_tokens")
            .upsert({ 
              user_id: user.id, 
              token: token,
              updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });
          
          if (error) {
            console.error("Error guardando token FCM en Supabase:", error.message, error.details);
            console.log("Assegura't d'haver creat la taula 'user_fcm_tokens' a Supabase.");
          }
        }
      };

      setupNotifications();
    }
  }, [user]);

  useEffect(() => {
    // Escuchar mensajes cuando la web está abierta (Foreground)
    onMessageListener().then((payload: any) => {
      if (payload?.notification) {
        // 1. Actualizar estado interno si quieres mostrar algo en la UI
        setNotification({
          title: payload.notification.title,
          body: payload.notification.body,
        });

        // 2. FORZAR notificación de sistema aunque la web esté abierta
        if (Notification.permission === "granted") {
          new Notification(payload.notification.title, {
            body: payload.notification.body,
            icon: "/Fotos/dj-posaxa-logo.png", // Usa tu logo
          });
        }
      }
      console.log("Notificació en primer pla rebuda:", payload);
    }).catch((err) => console.log("Error en el listener de primer pla: ", err));
  }, [notification]);

  return null; // Este componente no renderiza nada visualmente por defecto
}
