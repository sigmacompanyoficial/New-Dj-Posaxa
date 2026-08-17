import { requireAdmin, getAdminSupabaseClient } from "@/lib/auth-guard";
import { sendPushNotification } from "@/lib/firebase-admin";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Persistent database file path for reliable local/server persistence
const DB_FILE_PATH = path.join(process.cwd(), "src", "data", "song_requests_db.json");

// In-memory fallback
let memoryRequests: any[] = [];

// Helper to safely read from persistent store
const readPersistentStore = (): any[] => {
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const raw = fs.readFileSync(DB_FILE_PATH, "utf8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        memoryRequests = parsed;
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Could not read persistent DB file, using memory store:", e);
  }
  return memoryRequests;
};

// Helper to safely write to persistent store
const writePersistentStore = (data: any[]) => {
  try {
    memoryRequests = data;
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), "utf8");
  } catch (e) {
    console.warn("Could not write persistent DB file, saved to memory:", e);
  }
};

// Initialize persistent store on startup
readPersistentStore();

// In-memory rate limiting map for spam prevention (IP -> last timestamp)
const rateLimitMap = new Map<string, number>();

// Sanitize string to prevent basic injection / formatting issues
const sanitize = (str: any, maxLen: number = 100): string => {
  if (typeof str !== "string") return "";
  return str.trim().slice(0, maxLen);
};

const getSupabaseClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !serviceKey) return null;

  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const limitParam = parseInt(searchParams.get("limit") || "50", 10);
  const limit = Math.min(Math.max(limitParam, 1), 100);

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      let query = supabase
        .from("song_requests")
        .select("id, song_title, artist_name, album_art, preview_url, requester_name, notes, status, created_at, fcm_token")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (status && status !== "all") {
        query = query.eq("status", status);
      }

      const { data, error } = await query;
      if (!error && data) {
        // Sync Supabase data to persistent storage
        if (data.length > 0) {
          const currentStore = readPersistentStore();
          const merged = [...data];
          currentStore.forEach((localItem) => {
            if (!merged.some((m) => m.id === localItem.id)) {
              merged.push(localItem);
            }
          });
          writePersistentStore(merged.slice(0, 200));
        }
        return NextResponse.json({ requests: data }, {
          headers: { "Cache-Control": "no-cache, no-store, must-revalidate" }
        });
      }
    } catch (err) {
      console.warn("Supabase song_requests query failed, using persistent DB store:", err);
    }
  }

  // Use persistent store
  let list = readPersistentStore();
  if (status && status !== "all") {
    list = list.filter((r) => r.status === status);
  }
  return NextResponse.json({ requests: list.slice(0, limit) }, {
    headers: { "Cache-Control": "no-cache, no-store, must-revalidate" }
  });
}

export async function POST(request: Request) {
  try {
    // 1. IP-based rate limiting (1 request per 15s per IP)
    const clientIp = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "anonymous";
    const now = Date.now();
    const lastRequest = rateLimitMap.get(clientIp);

    if (lastRequest && now - lastRequest < 15000) {
      const waitTime = Math.ceil((15000 - (now - lastRequest)) / 1000);
      return NextResponse.json(
        { error: `Si us plau, espera ${waitTime}s abans de tornar a enviar una petició.` },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { song_title, artist_name, album_art, preview_url, requester_name, notes, fcm_token } = body;

    const cleanTitle = sanitize(song_title, 120);
    const cleanArtist = sanitize(artist_name, 100) || "Desconegut";
    const cleanRequester = sanitize(requester_name, 50) || "Anònim";
    const cleanNotes = sanitize(notes, 150);
    const cleanAlbumArt = typeof album_art === "string" && album_art.startsWith("http") ? album_art.slice(0, 300) : null;
    const cleanPreviewUrl = typeof preview_url === "string" && preview_url.startsWith("http") ? preview_url.slice(0, 500) : null;
    const cleanFcmToken = typeof fcm_token === "string" && fcm_token.length > 20 ? fcm_token.slice(0, 300) : null;

    if (!cleanTitle) {
      return NextResponse.json(
        { error: "El títol de la cançó és obligatori." },
        { status: 400 }
      );
    }

    // Update rate limit timestamp
    rateLimitMap.set(clientIp, now);

    // Clean old entries in rateLimitMap periodically
    if (rateLimitMap.size > 500) {
      for (const [ip, time] of rateLimitMap.entries()) {
        if (now - time > 60000) rateLimitMap.delete(ip);
      }
    }

    const newRequest = {
      id: "req_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
      song_title: cleanTitle,
      artist_name: cleanArtist,
      album_art: cleanAlbumArt,
      preview_url: cleanPreviewUrl,
      requester_name: cleanRequester,
      notes: cleanNotes || null,
      fcm_token: cleanFcmToken,
      status: "pending",
      created_at: new Date().toISOString(),
    };

    let insertedRecord = newRequest;

    // Save to Supabase if configured and available
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("song_requests")
          .insert([
            {
              song_title: newRequest.song_title,
              artist_name: newRequest.artist_name,
              album_art: newRequest.album_art,
              preview_url: newRequest.preview_url,
              requester_name: newRequest.requester_name,
              notes: newRequest.notes,
              fcm_token: newRequest.fcm_token,
              status: "pending",
            },
          ])
          .select()
          .single();

        if (!error && data) {
          insertedRecord = data;
        }
      } catch (err) {
        console.warn("Could not insert to Supabase, saving to persistent store:", err);
      }
    }

    // Always save to persistent database store
    const currentList = readPersistentStore();
    currentList.unshift(insertedRecord);
    writePersistentStore(currentList.slice(0, 200));

    return NextResponse.json({ success: true, request: insertedRecord }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating song request:", error);
    return NextResponse.json(
      { error: "Error en processar la petició de cançó." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  // Enforce admin authentication
  const auth = await requireAdmin(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !["pending", "played", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Dades no vàlides per actualitzar la petició." },
        { status: 400 }
      );
    }

    let updatedRecord: any = null;

    // 1. Try Supabase update
    const adminClient = getAdminSupabaseClient();
    if (adminClient) {
      try {
        const { data, error } = await adminClient
          .from("song_requests")
          .update({ status })
          .eq("id", id)
          .select()
          .single();

        if (!error && data) {
          updatedRecord = data;
        }
      } catch (err) {
        console.warn("Supabase update failed:", err);
      }
    }

    // 2. Update in persistent database store
    const currentList = readPersistentStore();
    const index = currentList.findIndex((r) => r.id === id);
    if (index !== -1) {
      currentList[index] = { ...currentList[index], status };
      if (!updatedRecord) {
        updatedRecord = currentList[index];
      }
      writePersistentStore(currentList);
    }

    if (!updatedRecord) {
      return NextResponse.json({ error: "Petició no trobada." }, { status: 404 });
    }

    // Send push notification to requester if FCM token exists
    if (updatedRecord.fcm_token && (status === "played" || status === "rejected")) {
      try {
        const title =
          status === "played"
            ? "🔥 La teva cançó està sonant!"
            : "❌ Petició de cançó actualitzada";

        const notificationBody =
          status === "played"
            ? `DJ Posaxa acaba de posar "${updatedRecord.song_title}" a la pista! A ballar! 🎉`
            : `El DJ no ha pogut incloure "${updatedRecord.song_title}" en aquesta sessió.`;

        await sendPushNotification({
          token: updatedRecord.fcm_token,
          title,
          body: notificationBody,
          url: "/peticiones-canciones",
        });
      } catch (notifErr) {
        console.warn("Could not send song request push notification:", notifErr);
      }
    }

    return NextResponse.json({ success: true, request: updatedRecord });
  } catch (error: any) {
    console.error("Error updating song request:", error);
    return NextResponse.json(
      { error: "Error en actualitzar la petició." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  // Enforce admin authentication
  const auth = await requireAdmin(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Falta el ID de la petició." }, { status: 400 });
    }

    // 1. Try Supabase delete
    const adminClient = getAdminSupabaseClient();
    if (adminClient) {
      try {
        await adminClient.from("song_requests").delete().eq("id", id);
      } catch (err) {
        console.warn("Supabase delete failed:", err);
      }
    }

    // 2. Delete from persistent database store
    const currentList = readPersistentStore();
    const filtered = currentList.filter((r) => r.id !== id);
    writePersistentStore(filtered);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting song request:", error);
    return NextResponse.json(
      { error: "Error en eliminar la petició." },
      { status: 500 }
    );
  }
}
