import { NextResponse } from "next/server";
import admin from "firebase-admin";

// Inicializar Firebase Admin si no está inicializado
if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    console.error("CRITICAL: Faltan credencials de Firebase Admin al .env.local (PROJECT_ID, CLIENT_EMAIL o PRIVATE_KEY)");
  } else {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, "\n"),
        }),
      });
      console.log("Firebase Admin inicialitzat correctament.");
    } catch (error) {
      console.error("Error inicialitzant Firebase Admin:", error);
    }
  }
}

export async function POST(request: Request) {
  try {
    if (!admin.apps.length) {
      return NextResponse.json({ 
        error: "Firebase Admin no inicialitzat. Falten variables al .env.local",
        detalls: "Necessites FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL i FIREBASE_PRIVATE_KEY"
      }, { status: 500 });
    }
    const { token, title, body } = await request.json();

    if (!token || !title || !body) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }

    const message = {
      notification: {
        title: title,
        body: body,
      },
      token: token,
      // Opcional: añadir datos para que la app reaccione (ej: abrir un chat específico)
      data: {
        click_action: "FLUTTER_NOTIFICATION_CLICK", // Esto es para compatibilidad
        url: "/perfil?tab=chat"
      }
    };

    const response = await admin.messaging().send(message);
    
    return NextResponse.json({ success: true, response });
  } catch (error: any) {
    console.error("Error enviando notificación:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
