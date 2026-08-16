import { requireAdmin, getAdminSupabaseClient } from "@/lib/auth-guard";
import { sendPushNotification } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const adminClient = getAdminSupabaseClient();
  if (!adminClient) {
    return NextResponse.json(
      { error: "Falta SUPABASE_SERVICE_ROLE_KEY al .env.local." },
      { status: 500 }
    );
  }

  try {
    const [reservationsResult, messagesResult] = await Promise.all([
      adminClient
        .from("reservations")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100),
      adminClient
        .from("messages")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(150),
    ]);

    if (reservationsResult.error) {
      return NextResponse.json({ error: reservationsResult.error.message }, { status: 500 });
    }

    if (messagesResult.error) {
      return NextResponse.json({ error: messagesResult.error.message }, { status: 500 });
    }

    return NextResponse.json({
      reservations: reservationsResult.data ?? [],
      messages: messagesResult.data ?? [],
    });
  } catch (err: any) {
    console.error("Admin data fetch error:", err);
    return NextResponse.json({ error: "Error en carregar les dades." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const auth = await requireAdmin(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const adminClient = getAdminSupabaseClient();
  if (!adminClient) {
    return NextResponse.json(
      { error: "Falta SUPABASE_SERVICE_ROLE_KEY al .env.local." },
      { status: 500 }
    );
  }

  const { reservationId, status } = await request.json();
  if (!reservationId || !["pendent", "acceptat", "rebutjat"].includes(status)) {
    return NextResponse.json({ error: "Dades de reserva no vàlides." }, { status: 400 });
  }

  const { data, error } = await adminClient
    .from("reservations")
    .update({ status })
    .eq("id", reservationId)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  try {
    const { data: tokenData } = await adminClient
      .from("user_fcm_tokens")
      .select("token")
      .eq("user_id", data.user_id)
      .maybeSingle();

    if (tokenData?.token) {
      await sendPushNotification({
        token: tokenData.token,
        title: status === "acceptat" ? "Reserva confirmada" : "Reserva actualitzada",
        body:
          status === "acceptat"
            ? `Bones notícies! La teva reserva per al ${data.event_date} ha estat acceptada.`
            : `La teva reserva per al ${data.event_date} ha estat rebutjada.`,
        url: "/perfil?tab=reservations",
      });
    }
  } catch (notificationError) {
    console.error("No s'ha pogut enviar la notificació de reserva:", notificationError);
  }

  return NextResponse.json({ reservation: data });
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const adminClient = getAdminSupabaseClient();
  if (!adminClient) {
    return NextResponse.json(
      { error: "Falta SUPABASE_SERVICE_ROLE_KEY al .env.local." },
      { status: 500 }
    );
  }

  const { userId, message } = await request.json();
  if (!userId || typeof message !== "string" || !message.trim()) {
    return NextResponse.json({ error: "Missatge no vàlid." }, { status: 400 });
  }

  const cleanMessage = message.trim().slice(0, 1000);

  const { data, error } = await adminClient
    .from("messages")
    .insert([
      {
        user_id: userId,
        sender_name: "DJ Posaxa (Admin)",
        message: cleanMessage,
        is_admin_reply: true,
      },
    ])
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  try {
    const { data: tokenData } = await adminClient
      .from("user_fcm_tokens")
      .select("token")
      .eq("user_id", userId)
      .maybeSingle();

    if (tokenData?.token) {
      await sendPushNotification({
        token: tokenData.token,
        title: "Nou missatge de DJ Posaxa",
        body: cleanMessage.slice(0, 80),
        url: "/perfil?tab=chat",
      });
    }
  } catch (notificationError) {
    console.error("No s'ha pogut enviar la notificació de xat:", notificationError);
  }

  return NextResponse.json({ message: data });
}
