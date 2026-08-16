"use client";

import { useState, useEffect, useRef } from "react";
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
  Bell,
  BellRing,
  Flame
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
  const [loadingRecent, setLoadingRecent] = useState(true);

  // Check notification permission and initialize token on mount
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "granted") {
        setNotificationsEnabled(true);
        requestForToken().then((tok) => {
          if (tok) setFcmToken(tok);
        });
      }
    }

    const lastRequest = localStorage.getItem("dj_posaxa_last_request_time");
    if (lastRequest) {
      const elapsed = Math.floor((Date.now() - parseInt(lastRequest, 10)) / 1000);
      if (elapsed < 30) {
        setCooldown(30 - elapsed);
      }
    }

    fetchRecentRequests();

    // Initialize global audio element
    if (!audioRef.current && typeof window !== "undefined") {
      const audio = new Audio();
      audio.preload = "auto";
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
        setAudioNotice("Vista prèvia d'àudio no disponible per a aquest tema.");
        setTimeout(() => setAudioNotice(null), 4000);
      };

      audioRef.current = audio;
    }

    // Interval to poll status changes for user's own requests (In-App Live Alert)
    const pollInterval = setInterval(() => {
      checkMyRequestsStatus();
    }, 10000);

    return () => {
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

  // Check if any of my submitted songs changed status
  const checkMyRequestsStatus = async () => {
    try {
      const stored = localStorage.getItem("dj_posaxa_my_requests");
      if (!stored) return;
      const myRequests: { id: string; title: string; artist: string; lastStatus: string }[] = JSON.parse(stored);
      if (!Array.isArray(myRequests) || myRequests.length === 0) return;

      const res = await fetch("/api/song-requests");
      const data = await res.json();
      if (!data.requests) return;

      const updatedStored = [...myRequests];

      data.requests.forEach((req: SongRequestItem) => {
        const myItem = updatedStored.find((m) => m.id === req.id);
        if (myItem && myItem.lastStatus === "pending" && req.status !== "pending") {
          // Status has changed! Trigger in-app live alert
          myItem.lastStatus = req.status;

          if (req.status === "played") {
            setLiveSongAlert({
              type: "played",
              title: req.song_title,
              artist: req.artist_name,
            });
            if (typeof navigator !== "undefined" && navigator.vibrate) {
              navigator.vibrate([200, 100, 200]);
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

      localStorage.setItem("dj_posaxa_my_requests", JSON.stringify(updatedStored));
      setRecentRequests(data.requests.slice(0, 8));
    } catch (e) {
      console.warn("Could not check status of my requests:", e);
    }
  };

  // Fetch recent requests
  const fetchRecentRequests = async () => {
    try {
      setLoadingRecent(true);
      const res = await fetch("/api/song-requests");
      const data = await res.json();
      if (data.requests) {
        setRecentRequests(data.requests.slice(0, 8));
      }
    } catch (e) {
      console.error("Error fetching recent requests:", e);
    } finally {
      setLoadingRecent(false);
    }
  };

  // Request push notification permission
  const handleEnableNotifications = async () => {
    try {
      const token = await requestForToken();
      if (token) {
        setFcmToken(token);
        setNotificationsEnabled(true);
        setAudioNotice("🔔 Notificacions activades! T'avisarem quan soni.");
        setTimeout(() => setAudioNotice(null), 4000);
      }
    } catch (err) {
      console.error("Error requesting notification token:", err);
    }
  };

  // Debounced search
  useEffect(() => {
    if (manualMode || selectedSong) return;
    if (query.trim().length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/song-requests/search?q=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        setResults(data.results || []);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query, manualMode, selectedSong]);

  // Audio preview toggle
  const togglePreview = async (id: string, previewUrl: string | null) => {
    if (!previewUrl) {
      setAudioNotice("Vista prèvia no disponible per a aquesta cançó.");
      setTimeout(() => setAudioNotice(null), 3000);
      return;
    }

    setAudioNotice(null);

    if (playingPreviewId === id) {
      if (audioRef.current) audioRef.current.pause();
      setPlayingPreviewId(null);
      setAudioBuffering(false);
    } else {
      try {
        if (!audioRef.current) {
          audioRef.current = new Audio();
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
        console.error("Error playing preview:", err);
        setPlayingPreviewId(null);
        setAudioBuffering(false);
        setAudioNotice("No s'ha pogut reproduir l'àudio en aquest navegador.");
        setTimeout(() => setAudioNotice(null), 4000);
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

    // Attempt to grab FCM token if not present yet
    let currentToken = fcmToken;
    if (!currentToken && typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      try {
        currentToken = await requestForToken();
        if (currentToken) setFcmToken(currentToken);
      } catch (e) {}
    }

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
          fcm_token: currentToken || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "No s'ha pogut enviar la petició.");
      }

      setSubmittedRequest(data.request);

      // Save to user's personal requests list in localStorage
      const existing = JSON.parse(localStorage.getItem("dj_posaxa_my_requests") || "[]");
      existing.unshift({
        id: data.request.id,
        title: data.request.song_title,
        artist: data.request.artist_name,
        lastStatus: "pending",
      });
      localStorage.setItem("dj_posaxa_my_requests", JSON.stringify(existing.slice(0, 20)));

      localStorage.setItem("dj_posaxa_last_request_time", Date.now().toString());
      setCooldown(30);
      handleClearSelection();
      setRequesterName("");
      setNotes("");
      fetchRecentRequests();
    } catch (err: any) {
      setErrorMsg(err.message || "Error en connectar amb el servidor.");
    } finally {
      setSubmitting(false);
    }
  };

  const isFormValid = (selectedSong !== null || manualTitle.trim().length > 0) && cooldown === 0;

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 md:pt-32 pb-24 px-4 md:px-6 relative overflow-hidden">
      {/* Ambient glowing lights */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-10 w-[400px] h-[400px] bg-white/5 rounded-full blur-[130px] pointer-events-none" />

      {/* Live In-App Notification Alert for DJ Action */}
      <AnimatePresence>
        {liveSongAlert && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.95 }}
            className={`fixed top-20 md:top-24 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-lg p-5 rounded-3xl border shadow-2xl backdrop-blur-2xl ${
              liveSongAlert.type === "played"
                ? "bg-black/90 border-green-500/50 shadow-green-500/20"
                : "bg-black/90 border-red-500/50 shadow-red-500/20"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                    liveSongAlert.type === "played"
                      ? "bg-green-500/20 text-green-400 border border-green-500/40 animate-bounce"
                      : "bg-red-500/20 text-red-400 border border-red-500/40"
                  }`}
                >
                  {liveSongAlert.type === "played" ? <Flame size={24} /> : <X size={24} />}
                </div>
                <div>
                  <span
                    className={`text-[10px] font-black uppercase tracking-widest ${
                      liveSongAlert.type === "played" ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {liveSongAlert.type === "played" ? "🔥 LA TEVA CANÇÓ ESTÀ SONANT!" : "❌ PETICIÓ ACTUALITZADA"}
                  </span>
                  <h4 className="text-base font-black uppercase text-white mt-0.5">
                    {liveSongAlert.title}
                  </h4>
                  <p className="text-xs text-gray-400">
                    {liveSongAlert.type === "played"
                      ? `DJ Posaxa acaba de posar el teu tema a la pista! A ballar! 🎉`
                      : `Ho sentim, el DJ no ha pogut posar aquesta cançó en aquesta sessió.`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setLiveSongAlert(null)}
                className="text-gray-400 hover:text-white p-1"
              >
                <X size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 md:mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest mb-4 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            <Radio size={14} className="text-red-400" />
            <span className="text-gray-300">Live DJ Set Request</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-white mb-4">
            Demanar <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-300 to-gray-600">Cançó</span>
          </h1>

          <p className="text-gray-400 text-sm md:text-base max-w-xl mx-auto font-light">
            Vols escoltar el teu tema favorit a la pista? Busca la cançó i envia la teva petició directa a la cabina de <span className="font-bold text-white">DJ Posaxa</span>. T'avisarem en directe quan soni!
          </p>

          {/* Push Notification Opt-in Prompt */}
          {!notificationsEnabled && (
            <div className="mt-4 flex justify-center">
              <button
                type="button"
                onClick={handleEnableNotifications}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold uppercase tracking-wider text-gray-300 hover:text-white transition-all hover:scale-105"
              >
                <BellRing size={14} className="text-yellow-400" />
                <span>Activar avisos quan soni la meva cançó</span>
              </button>
            </div>
          )}
        </motion.div>

        {/* Audio Toast Notice */}
        <AnimatePresence>
          {audioNotice && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-black/90 border border-white/20 px-5 py-3 rounded-full text-xs font-bold text-gray-200 shadow-2xl backdrop-blur-md flex items-center gap-2"
            >
              <VolumeX size={16} className="text-yellow-400" />
              <span>{audioNotice}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Confirmation Modal / Card */}
        <AnimatePresence>
          {submittedRequest && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="mb-10 bg-gradient-to-br from-white/15 to-white/5 border border-white/20 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden"
            >
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-green-500/20 border border-green-500/40 flex items-center justify-center text-green-400 shrink-0">
                  <CheckCircle2 size={36} />
                </div>
                <div className="text-center md:text-left flex-1">
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <span className="text-xs font-black uppercase tracking-widest text-green-400">
                      Petició enviada amb èxit!
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-gray-300 font-bold uppercase">
                      🔔 Notificació en directe activada
                    </span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-black uppercase text-white mt-1">
                    {submittedRequest.song_title}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {submittedRequest.artist_name} {submittedRequest.requester_name && submittedRequest.requester_name !== "Anònim" && ` • per ${submittedRequest.requester_name}`}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    La teva cançó està a la cua de DJ Posaxa. Rebràs una notificació instantània a la pantalla i al teu dispositiu quan el DJ la posi!
                  </p>
                </div>
                <button
                  onClick={() => setSubmittedRequest(null)}
                  className="px-5 py-2.5 rounded-xl bg-white text-black font-bold uppercase text-xs tracking-widest hover:scale-105 transition-transform"
                >
                  D'acord
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Form Card */}
        <div className="bg-white/5 border border-white/10 rounded-3xl md:rounded-[2.5rem] p-6 md:p-10 backdrop-blur-xl shadow-2xl mb-12">
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-300 text-sm flex items-center gap-3"
            >
              <AlertCircle size={20} className="shrink-0" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Song Selection Area */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
                1. Cerca la teva cançó *
              </label>

              {!selectedSong && !manualMode ? (
                <div className="relative">
                  <div className="relative flex items-center">
                    <Search className="absolute left-4 text-gray-500 pointer-events-none" size={20} />
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Escriu el nom de la cançó o artista (Ex: Bad Bunny, Quevedo, Morad...)"
                      className="w-full bg-black/60 border border-white/15 rounded-2xl py-4 pl-12 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-white/50 transition-all text-sm md:text-base font-medium"
                    />
                    {searching && (
                      <div className="absolute right-4 w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    )}
                    {!searching && query.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setQuery("")}
                        className="absolute right-4 text-gray-500 hover:text-white p-1"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>

                  {/* Autocomplete Dropdown */}
                  <AnimatePresence>
                    {results.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-[#0d0d0d] border border-white/15 rounded-2xl shadow-2xl max-h-80 overflow-y-auto z-50 divide-y divide-white/5"
                      >
                        {results.map((song) => {
                          const isPlaying = playingPreviewId === song.id;
                          return (
                            <div
                              key={song.id}
                              onClick={() => handleSelectSong(song)}
                              className="p-3.5 flex items-center justify-between gap-4 hover:bg-white/10 cursor-pointer transition-colors group"
                            >
                              <div className="flex items-center gap-3.5 min-w-0">
                                {song.albumArt ? (
                                  <img
                                    src={song.albumArt}
                                    alt={song.title}
                                    className="w-12 h-12 rounded-xl object-cover shrink-0 border border-white/10 shadow-md"
                                  />
                                ) : (
                                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-gray-400 shrink-0">
                                    <Music size={20} />
                                  </div>
                                )}
                                <div className="truncate">
                                  <p className="font-bold text-sm text-white group-hover:text-white truncate">
                                    {song.title}
                                  </p>
                                  <p className="text-xs text-gray-400 truncate">
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
                                    className={`p-2.5 rounded-full border transition-all ${
                                      isPlaying
                                        ? "bg-white text-black border-white shadow-lg shadow-white/20"
                                        : "bg-white/5 hover:bg-white/20 text-gray-300 hover:text-white border-white/10"
                                    }`}
                                    title={isPlaying ? "Pausar" : "Escoltar 30s preview"}
                                  >
                                    {isPlaying && audioBuffering ? (
                                      <Loader2 size={16} className="animate-spin" />
                                    ) : isPlaying ? (
                                      <Pause size={16} />
                                    ) : (
                                      <Play size={16} />
                                    )}
                                  </button>
                                )}
                                <button
                                  type="button"
                                  className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-xs font-bold uppercase tracking-wider group-hover:bg-white group-hover:text-black transition-colors"
                                >
                                  Triar
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="mt-3 flex justify-between items-center text-xs text-gray-500">
                    <span>Cerca en directe amb àudios i portades HD</span>
                    <button
                      type="button"
                      onClick={() => setManualMode(true)}
                      className="text-gray-400 hover:text-white underline transition-colors"
                    >
                      No la trobes? Escriu-la manualment
                    </button>
                  </div>
                </div>
              ) : selectedSong ? (
                /* Selected Song Card with Dynamic Audio Player */
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-r from-white/10 to-white/5 border border-white/20 rounded-2xl p-4 md:p-5 relative overflow-hidden"
                >
                  {/* Audio progress bar underneath */}
                  {playingPreviewId === selectedSong.id && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-white/10">
                      <div 
                        className="h-full bg-white transition-all duration-150"
                        style={{ width: `${audioProgress}%` }}
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="relative">
                        {selectedSong.albumArt ? (
                          <img
                            src={selectedSong.albumArt}
                            alt={selectedSong.title}
                            className={`w-16 h-16 rounded-xl object-cover border border-white/20 shadow-xl ${
                              playingPreviewId === selectedSong.id ? "ring-2 ring-white/50" : ""
                            }`}
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-white/15 flex items-center justify-center text-white">
                            <Disc size={28} className="animate-spin-slow" />
                          </div>
                        )}
                      </div>
                      <div className="truncate">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-green-500/20 text-green-400 text-[10px] font-black uppercase tracking-widest">
                            Seleccionada
                          </span>
                          {playingPreviewId === selectedSong.id && (
                            <span className="flex items-center gap-1 text-[10px] text-gray-300 font-bold uppercase tracking-wider">
                              <Volume2 size={12} className="animate-pulse text-green-400" />
                              Sonant preview
                            </span>
                          )}
                        </div>
                        <h4 className="text-base md:text-lg font-black uppercase text-white truncate mt-0.5">
                          {selectedSong.title}
                        </h4>
                        <p className="text-xs md:text-sm text-gray-300 truncate font-medium">
                          {selectedSong.artist}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {selectedSong.previewUrl && (
                        <button
                          type="button"
                          onClick={() => togglePreview(selectedSong.id, selectedSong.previewUrl)}
                          className={`p-3 rounded-xl border transition-all ${
                            playingPreviewId === selectedSong.id
                              ? "bg-white text-black border-white shadow-xl shadow-white/20"
                              : "bg-white/15 hover:bg-white/25 text-white border-white/20"
                          }`}
                          title="Escoltar preview 30s"
                        >
                          {playingPreviewId === selectedSong.id && audioBuffering ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : playingPreviewId === selectedSong.id ? (
                            <Pause size={18} />
                          ) : (
                            <Play size={18} />
                          )}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={handleClearSelection}
                        className="p-3 rounded-xl bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 border border-white/10 transition-colors"
                        title="Canviar cançó"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                /* Manual Input Form */
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-black/40 border border-white/10 rounded-2xl p-5 space-y-4"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-300">
                      Entrada manual
                    </span>
                    <button
                      type="button"
                      onClick={() => setManualMode(false)}
                      className="text-xs text-gray-400 hover:text-white underline"
                    >
                      Tornar al cercador
                    </button>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase text-gray-400 mb-1 block">
                      Títol de la cançó *
                    </label>
                    <input
                      type="text"
                      value={manualTitle}
                      onChange={(e) => setManualTitle(e.target.value)}
                      placeholder="Ex: Danza Kuduro / Remix especial"
                      className="w-full bg-black/60 border border-white/15 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-white/50"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase text-gray-400 mb-1 block">
                      Artista / Productor
                    </label>
                    <input
                      type="text"
                      value={manualArtist}
                      onChange={(e) => setManualArtist(e.target.value)}
                      placeholder="Ex: Don Omar / DJ Posaxa Bootleg"
                      className="w-full bg-black/60 border border-white/15 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-white/50"
                    />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Requester Name & Dedication */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                  2. El teu Nom o Àlies (Opcional)
                </label>
                <input
                  type="text"
                  value={requesterName}
                  onChange={(e) => setRequesterName(e.target.value)}
                  placeholder="Ex: Alex / La penya de Granollers"
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-3.5 text-white text-sm focus:outline-none focus:border-white/40 transition-colors"
                  maxLength={50}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                  3. Dedicatòria o Nota (Opcional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Per a l'aniversari de la Laura 🎉"
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-3.5 text-white text-sm focus:outline-none focus:border-white/40 transition-colors"
                  maxLength={120}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={!isFormValid || submitting}
                className="w-full relative group overflow-hidden bg-white text-black font-black uppercase tracking-widest py-4 md:py-5 rounded-2xl text-sm md:text-base hover:scale-[1.01] transition-all disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed shadow-xl shadow-white/5"
              >
                <div className="flex items-center justify-center gap-3">
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Enviant a la cabina...</span>
                    </>
                  ) : cooldown > 0 ? (
                    <>
                      <Clock size={18} />
                      <span>Espera {cooldown}s per a una nova petició</span>
                    </>
                  ) : (
                    <>
                      <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform" />
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
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight text-white flex items-center gap-2">
                <Sparkles size={18} className="text-yellow-400" />
                Peticions Recents
              </h3>
              <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mt-0.5">
                Temes que s'estan demanant a la festa
              </p>
            </div>
            <button
              onClick={fetchRecentRequests}
              className="text-xs text-gray-400 hover:text-white uppercase tracking-wider font-bold transition-colors"
            >
              Actualitzar
            </button>
          </div>

          {loadingRecent ? (
            <div className="text-center py-12 text-gray-500 text-sm">
              Carregant peticions en directe...
            </div>
          ) : recentRequests.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center text-gray-500 text-sm">
              Encara no hi ha peticions. Sigues el primer a demanar un temacle!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recentRequests.map((req) => {
                const isPlaying = playingPreviewId === req.id;
                return (
                  <div
                    key={req.id}
                    className="bg-white/5 border border-white/10 hover:border-white/20 rounded-2xl p-4 flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {req.album_art ? (
                        <img
                          src={req.album_art}
                          alt={req.song_title}
                          className="w-12 h-12 rounded-xl object-cover border border-white/10 shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-gray-400 shrink-0">
                          <Music size={18} />
                        </div>
                      )}
                      <div className="truncate">
                        <h5 className="font-bold text-sm text-white truncate">
                          {req.song_title}
                        </h5>
                        <p className="text-xs text-gray-400 truncate">
                          {req.artist_name}
                        </p>
                        {req.notes && (
                          <p className="text-[11px] text-gray-500 italic truncate mt-0.5">
                            "{req.notes}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {req.preview_url && (
                        <button
                          type="button"
                          onClick={() => togglePreview(req.id, req.preview_url || null)}
                          className={`p-2 rounded-full border transition-all ${
                            isPlaying
                              ? "bg-white text-black border-white"
                              : "bg-white/5 hover:bg-white/20 text-gray-400 hover:text-white border-white/10"
                          }`}
                          title="Escoltar preview"
                        >
                          {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                        </button>
                      )}
                      <span
                        className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full shrink-0 tracking-widest ${
                          req.status === "played"
                            ? "bg-green-500/20 text-green-400 border border-green-500/30"
                            : req.status === "rejected"
                            ? "bg-red-500/20 text-red-400 border border-red-500/30"
                            : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                        }`}
                      >
                        {req.status === "played" ? "Sonant" : req.status === "rejected" ? "Rebutjada" : "En Cua"}
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
