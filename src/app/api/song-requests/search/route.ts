import { NextResponse } from "next/server";

// Server-side cache for lightning-fast repeat searches (query -> { results, timestamp })
const searchCache = new Map<string, { results: any[]; expiry: number }>();
const CACHE_TTL_MS = 1000 * 60 * 60 * 2; // 2 hours

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawQuery = searchParams.get("q")?.trim() || "";

  if (!rawQuery || rawQuery.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const query = rawQuery.toLowerCase();

  // 1. Check in-memory server cache
  const cached = searchCache.get(query);
  if (cached && Date.now() < cached.expiry) {
    return NextResponse.json(
      { results: cached.results, cached: true },
      {
        headers: {
          "Cache-Control": "public, max-age=1800, stale-while-revalidate=86400",
        },
      }
    );
  }

  // Helper to store in cache
  const saveToCache = (results: any[]) => {
    if (searchCache.size > 500) {
      // Evict old entries if cache grows
      const now = Date.now();
      for (const [k, v] of searchCache.entries()) {
        if (now > v.expiry) searchCache.delete(k);
      }
      if (searchCache.size > 500) searchCache.clear();
    }
    searchCache.set(query, { results, expiry: Date.now() + CACHE_TTL_MS });
  };

  // 2. Try Deezer API first (with 2.5s strict timeout)
  try {
    const deezerUrl = `https://api.deezer.com/search?q=${encodeURIComponent(rawQuery)}&limit=10`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const response = await fetch(deezerUrl, {
      signal: controller.signal,
      next: { revalidate: 3600 },
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; DJPosaxaApp/1.0)",
        Accept: "application/json",
      },
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data?.data) && data.data.length > 0) {
        const results = data.data.map((track: any) => ({
          id: `dz_${track.id}`,
          title: track.title_short || track.title,
          artist: track.artist?.name || "Desconegut",
          album: track.album?.title || "",
          albumArt:
            track.album?.cover_medium ||
            track.album?.cover_big ||
            track.album?.cover ||
            track.artist?.picture_medium ||
            "",
          previewUrl: track.preview || null,
          duration: track.duration || 30,
          source: "deezer",
        }));

        saveToCache(results);
        return NextResponse.json(
          { results },
          {
            headers: {
              "Cache-Control": "public, max-age=1800, stale-while-revalidate=86400",
            },
          }
        );
      }
    }
  } catch (err) {
    // Timeout or network error on Deezer, seamlessly proceed to iTunes
  }

  // 3. Fallback to iTunes Search API (with 2.5s timeout)
  try {
    const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(
      rawQuery
    )}&entity=song&limit=10&country=ES&media=music`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const response = await fetch(itunesUrl, {
      signal: controller.signal,
      next: { revalidate: 3600 },
      headers: {
        "User-Agent": "DJPosaxaApp/1.0",
        Accept: "application/json",
      },
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data?.results) && data.results.length > 0) {
        const results = data.results.map((track: any) => ({
          id: `it_${track.trackId}`,
          title: track.trackName,
          artist: track.artistName,
          album: track.collectionName || "",
          albumArt: track.artworkUrl100
            ? track.artworkUrl100.replace("100x100bb", "300x300bb")
            : "",
          previewUrl: track.previewUrl || null,
          duration: 30,
          source: "itunes",
        }));

        saveToCache(results);
        return NextResponse.json(
          { results },
          {
            headers: {
              "Cache-Control": "public, max-age=1800, stale-while-revalidate=86400",
            },
          }
        );
      }
    }
  } catch (error: any) {
    console.error("All search providers failed:", error);
  }

  return NextResponse.json({ results: [] });
}
