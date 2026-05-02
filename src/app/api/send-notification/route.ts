import { sendPushNotification } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { token, title, body, url } = await request.json();

    if (!token || !title || !body) {
      return NextResponse.json({ error: "Falten camps obligatoris." }, { status: 400 });
    }

    const response = await sendPushNotification({
      token,
      title,
      body,
      url: url || "/perfil?tab=chat",
    });

    return NextResponse.json({ success: true, response });
  } catch (error: any) {
    console.error("Error enviant notificacio:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
