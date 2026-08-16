import { requireAdmin } from "@/lib/auth-guard";
import { sendPushNotification } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  // Enforce admin authentication to prevent unauthorized notification spam
  const auth = await requireAdmin(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { token, title, body, url } = await request.json();

    if (!token || !title || !body) {
      return NextResponse.json({ error: "Falten camps obligatoris." }, { status: 400 });
    }

    // Sanitize title & body length
    const cleanTitle = String(title).slice(0, 100);
    const cleanBody = String(body).slice(0, 250);
    const cleanUrl = url ? String(url).slice(0, 200) : "/perfil?tab=chat";

    const response = await sendPushNotification({
      token: String(token).trim(),
      title: cleanTitle,
      body: cleanBody,
      url: cleanUrl,
    });

    return NextResponse.json({ success: true, response });
  } catch (error: any) {
    console.error("Error enviant notificació:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
