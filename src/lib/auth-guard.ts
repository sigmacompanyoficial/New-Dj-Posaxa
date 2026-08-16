import { createClient } from "@supabase/supabase-js";

export const ADMIN_EMAILS = [
  "newposaxa@gmail.com",
  "ayoub.louah10@gmail.com",
  "sigmacompanyoficial@gmail.com",
];

export type AdminUser = {
  id: string;
  email?: string;
};

export const getSupabaseConfig = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !anonKey) {
    return {
      error: "Falten NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY al fitxer .env.",
    };
  }

  return { url, anonKey, serviceRoleKey };
};

export const getBearerToken = (request: Request) => {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  return authHeader.slice("Bearer ".length).trim();
};

export const requireAdmin = async (request: Request) => {
  const config = getSupabaseConfig();
  if ("error" in config) {
    return { error: config.error, status: 500 as const };
  }

  const token = getBearerToken(request);
  if (!token) {
    return { error: "Sessió no trobada. Inicia sessió com a administrador.", status: 401 as const };
  }

  const authClient = createClient(config.url, config.anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  
  const {
    data: { user },
    error,
  } = await authClient.auth.getUser(token);

  if (error || !user) {
    return { error: "Sessió invàlida o caducada.", status: 401 as const };
  }

  const adminUser: AdminUser = { id: user.id, email: user.email };

  if (user.email && ADMIN_EMAILS.includes(user.email.toLowerCase())) {
    return { user: adminUser, config };
  }

  if (config.serviceRoleKey) {
    const adminClient = createClient(config.url, config.serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data } = await adminClient
      .from("app_admins")
      .select("email")
      .eq("email", user.email?.toLowerCase())
      .maybeSingle();

    if (data) return { user: adminUser, config };
  }

  return { error: "No disposes de permisos d'administrador.", status: 403 as const };
};

export const getAdminSupabaseClient = () => {
  const config = getSupabaseConfig();
  if ("error" in config || !config.serviceRoleKey) {
    return null;
  }
  return createClient(config.url, config.serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
};
