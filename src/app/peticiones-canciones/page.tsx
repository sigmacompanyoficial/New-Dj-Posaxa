"use client";

import { useState, useEffect, useRef, useTransition, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Music, 
  Search, 
  Disc, 
  CheckCircle2, 
  Play, 
  Pause, 
  Sparkles, 
  Send, 
  Clock, 
  Radio, 
  Volume2, 
  VolumeX, 
  X, 
  AlertCircle, 
  Loader2, 
  BellRing, 
  Flame, 
  Check, 
  Headphones,
  Zap,
  TrendingUp
} from "lucide-react";
import { requestForToken } from "@/lib/firebase";

interface SongResult {
  id: string;
  title: string;
  artist: string;
  album: string;
  albumArt: string;
  previewUrl: string | null;
  duration?: number;
}

interface SongRequestItem {
  id: string;
  song_title: string;
  artist_name: string;
  album_art?: string;
  preview_url?: string;
  requester_name?: string;
  notes?: string;
  status: "pending" | "played" | "rejected";
  created_at: string;
}

// Popular mobile quick search tags for 1-tap search without virtual keyboard hassle
const QUICK_SUGGESTIONS = [
  "🔥 Top Hits",
  "Reggaeton",
  "Tech House",
  "Bad Bunny",
  "Quevedo",
  "Rauw Alejandro",
  "Feid",
  "Bizarrap",
  "Rosalía",
  "Morad",
  "Pop 2000s"
];

// In-memory client cache to make repeat searches instantaneous (0ms)
const clientSearchCache = new Map<string, SongResult[]>();

export default function SongRequestsPage() {
  // Search states
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SongResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedSong, setSelectedSong] = useState<SongResult | null>(null);
  const [manualMode, setManualMode] = useState(false);
  const [manualTitle, setManualTitle] = useState("");
  const [manualArtist, setManualArtist] = useState("");

  // Form states
  const [requesterName, setRequesterName] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Anti-spam cooldown
  const [cooldown, setCooldown] = useState(0);

  // Audio preview state
  const [playingPreviewId, setPlayingPreviewId] = useState<string | null>(null);
  const [audioBuffering, setAudioBuffering] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioNotice, setAudioNotice] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Live status alert banner for user's own songs
  const [liveSongAlert, setLiveSongAlert] = useState<{
    type: "played" | "rejected";
    title: string;
    artist: string;
  } | null>(null);

  // Recent requests feed
  const [recentRequests, setRecentRequests] = useState<SongRequestItem[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(false);

  // Non-blocking initialization on mount
  useEffect(() => {
    // 1. Check local cooldown
    const lastRequest = localStorage.getItem("dj_posaxa_last_request_time");
    if (lastRequest) {
      const elapsed = Math.floor((Date.now() - parseInt(lastRequest, 10)) / 1000);
      if (elapsed < 30) {
        setCooldown(30 - elapsed);
      }
    }

    // 2. Fetch recent requests lazily without blocking
    fetchRecentRequests();

    // 3. Defer notification token request so main thread stays light on mobile
    const timer = setTimeout(() => {
      if (typeof window !== "undefined" && "Notification" in window) {
        if (Notification.permission === "granted") {
          setNotificationsEnabled(true);
          requestForToken().then((tok) => {
            if (tok) setFcmToken(tok);
          }).catch(() => {});
        }
      }
    }, 1500);

    // 4. Auto-refresh recent requests and status changes every 10 seconds
    const pollInterval = setInterval(() => {
      fetchRecentRequests();
      checkMyRequestsStatus();
    }, 10000);

    return () => {
      clearTimeout(timer);
      clearInterval(pollInterval);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  // Cooldown countdown
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Check if any submitted songs changed status
  const checkMyRequestsStatus = async () => {
    try {
      const stored = localStorage.getItem("dj_posaxa_my_requests");
      if (!stored) return;
      const myRequests: { id: string; title: string; artist: string; lastStatus: string }[] = JSON.parse(stored);
      if (!Array.isArray(myRequests) || myRequests.length === 0) return;

      const hasPending = myRequests.some((m) => m.lastStatus === "pending");
      if (!hasPending) return;

      const res = await fetch("/api/song-requests");
      const data = await res.json();
      if (!data.requests) return;

      const updatedStored = [...myRequests];
      let stateChanged = false;

      data.requests.forEach((req: SongRequestItem) => {
        const myItem = updatedStored.find((m) => m.id === req.id);
        if (myItem && myItem.lastStatus === "pending" && req.status !== "pending") {
          myItem.lastStatus = req.status;
          stateChanged = true;

          if (req.status === "played") {
            setLiveSongAlert({
              type: "played",
              title: req.song_title,
              artist: req.artist_name,
            });
            if (typeof navigator !== "undefined" && navigator.vibrate) {
              try { navigator.vibrate([200, 100, 200]); } catch (e) {}
            }
          } else if (req.status === "rejected") {
            setLiveSongAlert({
              type: "rejected",
              title: req.song_title,
              artist: req.artist_name,
            });
          }
        }
      });

      if (stateChanged) {
        localStorage.setItem("dj_posaxa_my_requests", JSON.stringify(updatedStored));
        setRecentRequests(data.requests.slice(0, 8));
      }
    } catch (e) {
      // Quietly ignore polling failures
    }
  };

  // Fetch recent requests
  const fetchRecentRequests = async () => {
    try {
      setLoadingRecent(true);
      const res = await fetch("/api/song-requests?limit=8");
      const data = await res.json();
      if (data.requests) {
        setRecentRequests(data.requests);
      }
    } catch (e) {
      console.warn("Could not load recent requests:", e);
    } finally {
      setLoadingRecent(false);
    }
  };

  // Perform search with local client cache for instant mobile responsiveness
  const performSearch = useCallback(async (searchTerm: string) => {
    const clean = searchTerm.replace("🔥", "").trim();
    if (clean.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }

    const cacheKey = clean.toLowerCase();
    if (clientSearchCache.has(cacheKey)) {
      setResults(clientSearchCache.get(cacheKey)!);
      setSearching(false);
      return;
    }

    setSearching(true);
    try {
      const res = await fetch(`/api/song-requests/search?q=${encodeURIComponent(clean)}`);
      const data = await res.json();
      const list = data.results || [];
      clientSearchCache.set(cacheKey, list);
      setResults(list);
    } catch (err) {
      console.warn("Search network error:", err);
    } finally {
      setSearching(false);
    }
  }, []);

  // Debounced typing search
  useEffect(() => {
    if (manualMode || selectedSong) return;
    if (query.trim().length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }

    const clean = query.trim().toLowerCase();
    // If in cache, show immediately without waiting for debounce
    if (clientSearchCache.has(clean)) {
      setResults(clientSearchCache.get(clean)!);
      setSearching(false);
      return;
    }

    const timeout = setTimeout(() => {
      performSearch(query);
    }, 250);

    return () => clearTimeout(timeout);
  }, [query, manualMode, selectedSong, performSearch]);

  // Audio preview toggle
  const togglePreview = async (id: string, previewUrl: string | null) => {
    if (!previewUrl) {
      setAudioNotice("Vista prèvia no disponible per a aquest tema.");
      setTimeout(() => setAudioNotice(null), 3000);
      return;
    }

    setAudioNotice(null);

    if (playingPreviewId === id) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingPreviewId(null);
      setAudioBuffering(false);
    } else {
      try {
        if (!audioRef.current) {
          const audio = new Audio();
          audio.preload = "none";
          audio.crossOrigin = "anonymous";
          audio.onwaiting = () => setAudioBuffering(true);
          audio.onplaying = () => setAudioBuffering(false);
          audio.oncanplay = () => setAudioBuffering(false);
          audio.ontimeupdate = () => {
            if (audio.duration) {
              setAudioProgress((audio.currentTime / audio.duration) * 100);
            }
          };
          audio.onended = () => {
            setPlayingPreviewId(null);
            setAudioProgress(0);
            setAudioBuffering(false);
          };
          audio.onerror = () => {
            setPlayingPreviewId(null);
            setAudioBuffering(false);
            setAudioProgress(0);
            setAudioNotice("Vista prèvia no disponible en aquest dispositiu.");
            setTimeout(() => setAudioNotice(null), 3500);
          };
          audioRef.current = audio;
        }

        audioRef.current.pause();
        audioRef.current.src = previewUrl;
        audioRef.current.load();
        setPlayingPreviewId(id);
        setAudioBuffering(true);
        setAudioProgress(0);

        await audioRef.current.play();
        setAudioBuffering(false);
      } catch (err: any) {
        setPlayingPreviewId(null);
        setAudioBuffering(false);
        setAudioNotice("Toca de nou per escoltar la vista prèvia.");
        setTimeout(() => setAudioNotice(null), 3500);
      }
    }
  };

  const handleSelectSong = (song: SongResult) => {
    setSelectedSong(song);
    setQuery("");
    setResults([]);
    setErrorMsg(null);
  };

  const handleClearSelection = () => {
    setSelectedSong(null);
    setManualTitle("");
    setManualArtist("");
    setManualMode(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    setPlayingPreviewId(null);
    setAudioProgress(0);
  };

  const handleQuickChipClick = (suggestion: string) => {
    const clean = suggestion.replace("🔥", "").trim();
    setQuery(clean);
    performSearch(clean);
  };

  const handleEnableNotifications = async () => {
    try {
      const token = await requestForToken();
      if (token) {
        setFcmToken(token);
        setNotificationsEnabled(true);
        setAudioNotice("🔔 Notificacions activades! T'avisarem quan soni.");
        setTimeout(() => setAudioNotice(null), 3500);
      }
    } catch (err) {
      console.warn("Notification enable error:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const songTitle = selectedSong ? selectedSong.title : manualTitle.trim();
    const artistName = selectedSong ? selectedSong.artist : manualArtist.trim();

    if (!songTitle) {
      setErrorMsg("Si us plau, selecciona o escriu el títol d'una cançó.");
      return;
    }

    if (cooldown > 0) {
      setErrorMsg(`Has d'esperar ${cooldown}s abans de fer una altra petició.`);
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/song-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          song_title: songTitle,
          artist_name: artistName || "Desconegut",
          album_art: selectedSong?.albumArt || null,
          preview_url: selectedSong?.previewUrl || null,
          requester_name: requesterName.trim() || "Anònim",
          notes: notes.trim() || null,
          fcm_token: fcmToken || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "No s'ha pogut enviar la petició.");
      }

      setSubmittedRequest(data.request);

      // Save to user's local tracking list
      try {
        const existing = JSON.parse(localStorage.getItem("dj_posaxa_my_requests") || "[]");
        existing.unshift({
          id: data.request.id,
          title: data.request.song_title,
          artist: data.request.artist_name,
          lastStatus: "pending",
        });
        localStorage.setItem("dj_posaxa_my_requests", JSON.stringify(existing.slice(0, 20)));
        localStorage.setItem("dj_posaxa_last_request_time", Date.now().toString());
      } catch (e) {}

      setCooldown(30);
      handleClearSelection();
      setRequesterName("");
      setNotes("");
      fetchRecentRequests();

      // Scroll smoothly to confirmation if needed
      window.scrollTo({ top: 120, behavior: "smooth" });
    } catch (err: any) {
      setErrorMsg(err.message || "Error en connectar amb el servidor.");
    } finally {
      setSubmitting(false);
    }
  };

  const isFormValid = (selectedSong !== null || manualTitle.trim().length > 0) && cooldown === 0;

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-16 sm:pt-20 md:pt-28 pb-20 sm:pb-28 px-3 sm:px-6 relative overflow-x-hidden selection:bg-white selection:text-black">
      {/* High-performance CSS radial gradients (Zero GPU lag on mobile) */}
      <div 
        className="fixed inset-0 pointer-events-none z-0" 
        style={{
          background: "radial-gradient(circle at 50% 15%, rgba(220, 38, 38, 0.12) 0%, transparent 65%), radial-gradient(circle at 85% 75%, rgba(255, 255, 255, 0.03) 0%, transparent 50%)",
        }} 
      />

      {/* Live In-App Notification Alert for DJ Action */}
      <AnimatePresence>
        {liveSongAlert && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.95 }}
            className={`fixed top-14 sm:top-20 md:top-24 left-1/2 -translate-x-1/2 z-50 w-[94%] sm:w-11/12 max-w-md p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border shadow-2xl backdrop-blur-md ${
              liveSongAlert.type === "played"
                ? "bg-black/95 border-green-500/50 shadow-green-500/20"
                : "bg-black/95 border-red-500/50 shadow-red-500/20"
            }`}
          >
            <div className="flex items-start justify-between gap-2.5 sm:gap-3">
              <div className="flex items-center gap-2.5 sm:gap-3.5">
                <div
                  className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 ${
                    liveSongAlert.type === "played"
                      ? "bg-green-500/20 text-green-400 border border-green-500/40 animate-pulse"
                      : "bg-red-500/20 text-red-400 border border-red-500/40"
                  }`}
                >
                  {liveSongAlert.type === "played" ? <Flame size={18} /> : <X size={18} />}
                </div>
                <div>
                  <span
                    className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest ${
                      liveSongAlert.type === "played" ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {liveSongAlert.type === "played" ? "🔥 LA TEVA CANÇÓ ESTÀ SONANT!" : "❌ PETICIÓ ACTUALITZADA"}
                  </span>
                  <h4 className="text-xs sm:text-sm font-black uppercase text-white leading-tight mt-0.5">
                    {liveSongAlert.title}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5">
                    {liveSongAlert.type === "played"
                      ? `DJ Posaxa acaba de punxar el teu tema a la pista! A ballar! 🎉`
                      : `El DJ no ha pogut posar aquest tema en aquesta sessió.`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setLiveSongAlert(null)}
                className="text-gray-400 hover:text-white p-1 touch-manipulation"
                aria-label="Tancar avís"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Header section */}
        <div className="text-center mb-6 sm:mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-white/10 border border-white/15 text-[10px] sm:text-[11px] font-black uppercase tracking-wider sm:tracking-widest mb-2.5 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-red-500 animate-ping"></span>
            <Radio size={12} className="text-red-400" />
            <span className="text-gray-200">Live DJ Set Request</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white mb-2 sm:mb-3">
            Demanar <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-500">Cançó</span>
          </h1>

          <p className="text-gray-400 text-xs sm:text-sm md:text-base max-w-lg mx-auto font-light leading-relaxed">
            Busca la teva cançó preferida i envia-la directa a la taula de <span className="font-bold text-white">DJ Posaxa</span>. T'avisem al mòbil quan soni!
          </p>

          {/* Quick Notification Enable Banner */}
          {!notificationsEnabled && (
            <div className="mt-3 flex justify-center">
              <button
                type="button"
                onClick={handleEnableNotifications}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 border border-white/15 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-200 hover:text-white transition-all touch-manipulation"
              >
                <BellRing size={12} className="text-yellow-400 shrink-0" />
                <span>Activar avisos quan soni el meu tema</span>
              </button>
            </div>
          )}
        </div>

        {/* Audio Toast Notice */}
        <AnimatePresence>
          {audioNotice && (
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="fixed top-16 sm:top-20 left-1/2 -translate-x-1/2 z-50 bg-[#111] border border-white/20 px-3.5 py-2 rounded-full text-xs font-bold text-gray-200 shadow-2xl backdrop-blur-md flex items-center gap-2"
            >
              <VolumeX size={14} className="text-yellow-400 shrink-0" />
              <span>{audioNotice}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Confirmation Modal / Card */}
        <AnimatePresence>
          {submittedRequest && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="mb-6 sm:mb-8 bg-gradient-to-br from-green-500/15 via-white/10 to-white/5 border border-green-500/30 rounded-2xl sm:rounded-3xl p-4 sm:p-7 backdrop-blur-md shadow-2xl relative overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row items-center gap-3.5 sm:gap-6 text-center sm:text-left">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-green-500/20 border border-green-500/40 flex items-center justify-center text-green-400 shrink-0">
                  <CheckCircle2 size={28} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 sm:gap-2 mb-1">
                    <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-green-400">
                      Petició rebuda amb èxit!
                    </span>
                    <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-gray-300 font-bold uppercase">
                      🔔 En cua
                    </span>
                  </div>
                  <h3 className="text-base sm:text-xl font-black uppercase text-white truncate">
                    {submittedRequest.song_title}
                  </h3>
                  <p className="text-xs text-gray-300">
                    {submittedRequest.artist_name} {submittedRequest.requester_name && submittedRequest.requester_name !== "Anònim" && ` • per ${submittedRequest.requester_name}`}
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-gray-400 mt-1">
                    T'arribarà un avís quan comenci a sonar a la pista!
                  </p>
                </div>
                <button
                  onClick={() => setSubmittedRequest(null)}
                  className="w-full sm:w-auto px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl bg-white text-black font-bold uppercase text-[11px] sm:text-xs tracking-widest active:scale-95 transition-transform shrink-0 touch-manipulation"
                >
                  D'acord
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Request Form Container */}
        <div className="bg-[#0e0e0e]/90 border border-white/15 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 backdrop-blur-md shadow-2xl mb-8 sm:mb-10">
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 sm:mb-5 p-3 rounded-xl sm:rounded-2xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs sm:text-sm flex items-center gap-2"
            >
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Step 1: Song Search & Selection */}
            <div>
              <div className="flex justify-between items-center mb-2.5">
                <label className="text-xs font-black uppercase tracking-widest text-gray-300 flex items-center gap-1.5">
                  <Music size={14} className="text-red-400" />
                  1. Cerca el teu tema *
                </label>
                {!selectedSong && !manualMode && (
                  <button
                    type="button"
                    onClick={() => setManualMode(true)}
                    className="text-[11px] text-gray-400 hover:text-white underline touch-manipulation"
                  >
                    Escriure manualment
                  </button>
                )}
              </div>

              {!selectedSong && !manualMode ? (
                <div className="space-y-3">
                  {/* Search Input with Clear Button and Instant Icon */}
                  <div className="relative flex items-center">
                    <Search className="absolute left-4 text-gray-400 pointer-events-none" size={18} />
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Cerca per cançó o artista (Ex: Bad Bunny, Quevedo...)"
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck={false}
                      enterKeyHint="search"
                      className="w-full bg-black/70 border border-white/20 focus:border-white rounded-2xl py-3.5 pl-11 pr-11 text-white placeholder-gray-500 focus:outline-none text-sm md:text-base font-medium transition-colors"
                    />
                    {searching ? (
                      <div className="absolute right-4 w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : query.length > 0 ? (
                      <button
                        type="button"
                        onClick={() => {
                          setQuery("");
                          setResults([]);
                        }}
                        className="absolute right-3.5 p-1 text-gray-400 hover:text-white touch-manipulation"
                        aria-label="Esborrar text"
                      >
                        <X size={18} />
                      </button>
                    ) : null}
                  </div>

                  {/* 1-Tap Quick Suggestions for Mobile */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar touch-pan-x">
                    <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 shrink-0 flex items-center gap-1">
                      <Zap size={11} className="text-yellow-400" /> Idees:
                    </span>
                    {QUICK_SUGGESTIONS.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleQuickChipClick(tag)}
                        className="shrink-0 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 active:scale-95 border border-white/10 text-[10px] font-bold text-gray-300 hover:text-white transition-all touch-manipulation"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>

                  {/* Search Results List */}
                  {results.length > 0 && (
                    <div className="bg-[#121212] border border-white/15 rounded-2xl overflow-hidden shadow-2xl divide-y divide-white/5 max-h-72 sm:max-h-80 overflow-y-auto">
                      {results.map((song) => {
                        const isPlaying = playingPreviewId === song.id;
                        return (
                          <div
                            key={song.id}
                            onClick={() => handleSelectSong(song)}
                            className="p-3 flex items-center justify-between gap-3 hover:bg-white/10 active:bg-white/15 cursor-pointer transition-colors touch-manipulation group"
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              {song.albumArt ? (
                                <img
                                  src={song.albumArt}
                                  alt={song.title}
                                  loading="lazy"
                                  decoding="async"
                                  className="w-11 h-11 rounded-xl object-cover shrink-0 border border-white/10 bg-black/40"
                                />
                              ) : (
                                <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center text-gray-400 shrink-0">
                                  <Music size={18} />
                                </div>
                              )}
                              <div className="min-w-0 truncate">
                                <p className="font-bold text-xs sm:text-sm text-white truncate group-hover:text-white">
                                  {song.title}
                                </p>
                                <p className="text-[11px] text-gray-400 truncate">
                                  {song.artist} {song.album && `• ${song.album}`}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {song.previewUrl && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    togglePreview(song.id, song.previewUrl);
                                  }}
                                  className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all touch-manipulation ${
                                    isPlaying
                                      ? "bg-white text-black border-white shadow-md"
                                      : "bg-white/10 hover:bg-white/20 active:scale-90 text-gray-200 border-white/15"
                                  }`}
                                  title={isPlaying ? "Pausar" : "Preview 30s"}
                                  aria-label={isPlaying ? "Pausar àudio" : "Escoltar vista prèvia"}
                                >
                                  {isPlaying && audioBuffering ? (
                                    <Loader2 size={15} className="animate-spin" />
                                  ) : isPlaying ? (
                                    <Pause size={15} />
                                  ) : (
                                    <Play size={15} className="ml-0.5" />
                                  )}
                                </button>
                              )}
                              <button
                                type="button"
                                className="px-3 py-1.5 rounded-xl bg-white text-black text-[11px] font-black uppercase tracking-wider active:scale-95 transition-transform touch-manipulation"
                              >
                                Triar
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : selectedSong ? (
                /* Selected Song Card with Dynamic Audio Player */
                <div className="bg-gradient-to-r from-white/15 to-white/5 border border-white/30 rounded-2xl p-4 relative overflow-hidden shadow-xl">
                  {playingPreviewId === selectedSong.id && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-white/10">
                      <div 
                        className="h-full bg-white transition-all duration-150"
                        style={{ width: `${audioProgress}%` }}
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <div className="relative shrink-0">
                        {selectedSong.albumArt ? (
                          <img
                            src={selectedSong.albumArt}
                            alt={selectedSong.title}
                            loading="lazy"
                            className={`w-14 h-14 rounded-xl object-cover border border-white/20 ${
                              playingPreviewId === selectedSong.id ? "ring-2 ring-white/60" : ""
                            }`}
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-white/15 flex items-center justify-center text-white">
                            <Disc size={24} className="animate-spin" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 truncate">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="px-2 py-0.5 rounded bg-green-500/20 text-green-400 text-[9px] font-black uppercase tracking-widest">
                            Seleccionada
                          </span>
                          {playingPreviewId === selectedSong.id && (
                            <span className="flex items-center gap-1 text-[9px] text-gray-300 font-bold uppercase">
                              <Volume2 size={11} className="text-green-400 animate-pulse" />
                              Sonant preview
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm sm:text-base font-black uppercase text-white truncate">
                          {selectedSong.title}
                        </h4>
                        <p className="text-xs text-gray-300 truncate font-medium">
                          {selectedSong.artist}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {selectedSong.previewUrl && (
                        <button
                          type="button"
                          onClick={() => togglePreview(selectedSong.id, selectedSong.previewUrl)}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all touch-manipulation ${
                            playingPreviewId === selectedSong.id
                              ? "bg-white text-black border-white shadow-lg"
                              : "bg-white/15 hover:bg-white/25 active:scale-90 text-white border-white/20"
                          }`}
                          title="Escoltar preview"
                          aria-label="Escoltar preview"
                        >
                          {playingPreviewId === selectedSong.id && audioBuffering ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : playingPreviewId === selectedSong.id ? (
                            <Pause size={16} />
                          ) : (
                            <Play size={16} className="ml-0.5" />
                          )}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={handleClearSelection}
                        className="w-10 h-10 rounded-xl bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 border border-white/10 flex items-center justify-center transition-colors touch-manipulation"
                        title="Canviar cançó"
                        aria-label="Canviar cançó"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Manual Input Form Mode */
                <div className="bg-black/50 border border-white/15 rounded-2xl p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-300">
                      Entrada manual
                    </span>
                    <button
                      type="button"
                      onClick={() => setManualMode(false)}
                      className="text-xs text-gray-400 hover:text-white underline touch-manipulation"
                    >
                      Tornar al cercador
                    </button>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-gray-400 mb-1 block">
                      Títol de la cançó *
                    </label>
                    <input
                      type="text"
                      value={manualTitle}
                      onChange={(e) => setManualTitle(e.target.value)}
                      placeholder="Ex: Danza Kuduro / Remix especial"
                      autoComplete="off"
                      className="w-full bg-black/70 border border-white/15 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-gray-400 mb-1 block">
                      Artista / Productor
                    </label>
                    <input
                      type="text"
                      value={manualArtist}
                      onChange={(e) => setManualArtist(e.target.value)}
                      placeholder="Ex: Don Omar / DJ Posaxa"
                      autoComplete="off"
                      className="w-full bg-black/70 border border-white/15 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-white"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Step 2 & 3: Requester Name & Dedication */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-gray-300 mb-1">
                  2. El teu Nom o Àlies (Opcional)
                </label>
                <input
                  type="text"
                  value={requesterName}
                  onChange={(e) => setRequesterName(e.target.value)}
                  placeholder="Ex: Marc / La penya de Granollers"
                  autoComplete="name"
                  maxLength={50}
                  className="w-full bg-black/60 border border-white/15 rounded-xl p-2.5 sm:p-3 text-white text-xs sm:text-sm focus:outline-none focus:border-white/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-gray-300 mb-1">
                  3. Dedicatòria o Nota (Opcional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Per a l'aniversari de la Laura 🎉"
                  maxLength={120}
                  className="w-full bg-black/60 border border-white/15 rounded-xl p-2.5 sm:p-3 text-white text-xs sm:text-sm focus:outline-none focus:border-white/50 transition-colors"
                />
              </div>
            </div>

            {/* Submit Action Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={!isFormValid || submitting}
                className="w-full bg-white text-black font-black uppercase tracking-wider sm:tracking-widest py-3.5 sm:py-4 rounded-xl sm:rounded-2xl text-xs sm:text-sm active:scale-[0.98] transition-all disabled:opacity-40 disabled:active:scale-100 disabled:cursor-not-allowed shadow-xl touch-manipulation"
              >
                <div className="flex items-center justify-center gap-2">
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Enviant a la cabina...</span>
                    </>
                  ) : cooldown > 0 ? (
                    <>
                      <Clock size={15} />
                      <span>Espera {cooldown}s per a una nova petició</span>
                    </>
                  ) : (
                    <>
                      <Send size={15} />
                      <span>Enviar Petició de Cançó</span>
                    </>
                  )}
                </div>
              </button>
            </div>
          </form>
        </div>

        {/* Live Requests Feed */}
        <div>
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <div>
              <h3 className="text-base sm:text-lg md:text-xl font-black uppercase tracking-tight text-white flex items-center gap-1.5 sm:gap-2">
                <Sparkles size={15} className="text-yellow-400" />
                Peticions Recents
                <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] text-green-400 font-bold px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping" />
                  Live
                </span>
              </h3>
              <p className="text-[10px] sm:text-[11px] text-gray-500 uppercase tracking-wider sm:tracking-widest font-bold mt-0.5">
                Temes demanats en directe • S'actualitza cada 10s
              </p>
            </div>
            <button
              onClick={fetchRecentRequests}
              className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-white/5 hover:bg-white/10 active:scale-95 text-[10px] sm:text-[11px] text-gray-300 hover:text-white uppercase tracking-wider font-bold transition-all touch-manipulation"
            >
              Actualitzar
            </button>
          </div>

          {loadingRecent && recentRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-xs">
              Carregant peticions en directe...
            </div>
          ) : recentRequests.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6 text-center text-gray-400 text-xs">
              Encara no hi ha peticions. Sigues el primer a demanar un temacle!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              {recentRequests.map((req) => {
                const isPlaying = playingPreviewId === req.id;
                return (
                  <div
                    key={req.id}
                    className="bg-[#0e0e0e]/80 border border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-2.5 sm:gap-3 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                      {req.album_art ? (
                        <img
                          src={req.album_art}
                          alt={req.song_title}
                          loading="lazy"
                          decoding="async"
                          className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl object-cover border border-white/10 shrink-0 bg-black/40"
                        />
                      ) : (
                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-white/10 flex items-center justify-center text-gray-400 shrink-0">
                          <Music size={15} />
                        </div>
                      )}
                      <div className="min-w-0 truncate">
                        <h5 className="font-bold text-xs text-white truncate">
                          {req.song_title}
                        </h5>
                        <p className="text-[11px] text-gray-400 truncate">
                          {req.artist_name}
                        </p>
                        {req.notes && (
                          <p className="text-[10px] text-gray-500 italic truncate mt-0.5">
                            "{req.notes}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                      {req.preview_url && (
                        <button
                          type="button"
                          onClick={() => togglePreview(req.id, req.preview_url || null)}
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border transition-all touch-manipulation ${
                            isPlaying
                              ? "bg-white text-black border-white"
                              : "bg-white/5 hover:bg-white/20 active:scale-90 text-gray-300 border-white/10"
                          }`}
                          title="Escoltar preview"
                          aria-label="Escoltar preview"
                        >
                          {isPlaying ? <Pause size={12} /> : <Play size={12} className="ml-0.5" />}
                        </button>
                      )}
                      <span
                        className={`text-[8px] sm:text-[9px] font-black uppercase px-1.5 sm:px-2 py-0.5 rounded-full shrink-0 tracking-wider sm:tracking-widest ${
                          req.status === "played"
                            ? "bg-green-500/20 text-green-400 border border-green-500/30"
                            : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                        }`}
                      >
                        {req.status === "played" ? "Sonant" : "En Cua"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
