import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  // 1. Try Deezer API first (highest reliability, native MP3 audio previews, Latin/Urban coverage)
  try {
    const deezerUrl = `https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=12`;
    const response = await fetch(deezerUrl, {
      next: { revalidate: 1800 },
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; DJPosaxaApp/1.0)",
        Accept: "application/json",
      },
    });

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

        return NextResponse.json({ results });
      }
    }
  } catch (err) {
    console.warn("Deezer search failed, trying iTunes fallback:", err);
  }

  // 2. Fallback to iTunes Search API (with ES store for optimal Spanish / Catalan music matching)
  try {
    const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(
      query
    )}&entity=song&limit=12&country=ES&media=music`;

    const response = await fetch(itunesUrl, {
      next: { revalidate: 1800 },
      headers: {
        "User-Agent": "DJPosaxaApp/1.0",
        Accept: "application/json",
      },
    });

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

        return NextResponse.json({ results });
      }
    }
  } catch (error: any) {
    console.error("All search providers failed:", error);
  }

  return NextResponse.json({ results: [] });
}
