import { createClient } from "@supabase/supabase-js";
import { sendPushNotification } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";

const ADMIN_EMAILS = [
  "newposaxa@gmail.com",
  "ayoub.louah10@gmail.com",
  "sigmacompanyoficial@gmail.com",
];

type AdminUser = {
  id: string;
  email?: string;
};

const getSupabaseConfig = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !anonKey) {
    return {
      error: "Falten NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    };
  }

  return { url, anonKey, serviceRoleKey };
};

const getBearerToken = (request: Request) => {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  return authHeader.slice("Bearer ".length);
};

const requireAdmin = async (request: Request) => {
  const config = getSupabaseConfig();
  if ("error" in config) {
    return { error: config.error, status: 500 as const };
  }

  const token = getBearerToken(request);
  if (!token) {
    return { error: "Sessio no trobada. Torna a iniciar sessio.", status: 401 as const };
  }

  const authClient = createClient(config.url, config.anonKey);
  const {
    data: { user },
    error,
  } = await authClient.auth.getUser(token);

  if (error || !user) {
    return { error: "Sessio no valida. Torna a iniciar sessio.", status: 401 as const };
  }

  const adminUser: AdminUser = { id: user.id, email: user.email };
  if (user.email && ADMIN_EMAILS.includes(user.email)) {
    return { user: adminUser, config };
  }

  if (config.serviceRoleKey) {
    const adminClient = createClient(config.url, config.serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data } = await adminClient
      .from("app_admins")
      .select("email")
      .eq("email", user.email)
      .maybeSingle();

    if (data) return { user: adminUser, config };
  }

  return { error: "No tens permisos d'administrador.", status: 403 as const };
};

const getAdminClient = (config: {
  url: string;
  serviceRoleKey?: string;
}) => {
  if (!config.serviceRoleKey) {
    return {
      error:
        "Falta SUPABASE_SERVICE_ROLE_KEY al .env.local. Sense aquesta clau, el panel admin no pot llegir totes les reserves i xats amb RLS activat.",
    };
  }

  return {
    client: createClient(config.url, config.serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    }),
  };
};

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const admin = getAdminClient(auth.config);
  if ("error" in admin) {
    return NextResponse.json({ error: admin.error }, { status: 500 });
  }

  const [reservationsResult, messagesResult] = await Promise.all([
    admin.client.from("reservations").select("*").order("created_at", { ascending: false }),
    admin.client.from("messages").select("*").order("created_at", { ascending: false }),
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
}

export async function PATCH(request: Request) {
  const auth = await requireAdmin(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const admin = getAdminClient(auth.config);
  if ("error" in admin) {
    return NextResponse.json({ error: admin.error }, { status: 500 });
  }

  const { reservationId, status } = await request.json();
  if (!reservationId || !["pendent", "acceptat", "rebutjat"].includes(status)) {
    return NextResponse.json({ error: "Dades de reserva no valides." }, { status: 400 });
  }

  const { data, error } = await admin.client
    .from("reservations")
    .update({ status })
    .eq("id", reservationId)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  try {
    const { data: tokenData } = await admin.client
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
            ? `Bones noticies! La teva reserva per al ${data.event_date} ha estat acceptada.`
            : `La teva reserva per al ${data.event_date} ha estat rebutjada.`,
        url: "/perfil?tab=reservations",
      });
    }
  } catch (notificationError) {
    console.error("No s'ha pogut enviar la notificacio de reserva:", notificationError);
  }

  return NextResponse.json({ reservation: data });
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const admin = getAdminClient(auth.config);
  if ("error" in admin) {
    return NextResponse.json({ error: admin.error }, { status: 500 });
  }

  const { userId, message } = await request.json();
  if (!userId || typeof message !== "string" || !message.trim()) {
    return NextResponse.json({ error: "Missatge no valid." }, { status: 400 });
  }

  const { data, error } = await admin.client
    .from("messages")
    .insert([
      {
        user_id: userId,
        sender_name: "DJ Posaxa (Admin)",
        message: message.trim(),
        is_admin_reply: true,
      },
    ])
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  try {
    const { data: tokenData } = await admin.client
      .from("user_fcm_tokens")
      .select("token")
      .eq("user_id", userId)
      .maybeSingle();

    if (tokenData?.token) {
      await sendPushNotification({
        token: tokenData.token,
        title: "Nou missatge de DJ Posaxa",
        body: message.trim().slice(0, 80),
        url: "/perfil?tab=chat",
      });
    }
  } catch (notificationError) {
    console.error("No s'ha pogut enviar la notificacio de xat:", notificationError);
  }

  return NextResponse.json({ message: data });
}
