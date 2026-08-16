import "server-only";
import admin from "firebase-admin";

const getFirebaseAdmin = () => {
  if (admin.apps.length) return admin;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Firebase Admin no inicialitzat. Falten FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL o FIREBASE_PRIVATE_KEY."
    );
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, "\n"),
    }),
  });

  return admin;
};

export const sendPushNotification = async ({
  token,
  title,
  body,
  url = "/perfil",
}: {
  token: string;
  title: string;
  body: string;
  url?: string;
}) => {
  const firebaseAdmin = getFirebaseAdmin();

  return firebaseAdmin.messaging().send({
    notification: {
      title,
      body,
    },
    token,
    webpush: {
      notification: {
        icon: "/Fotos/dj-posaxa-logo.png",
      },
      fcmOptions: {
        link: url,
      },
    },
    data: {
      url,
    },
  });
};
