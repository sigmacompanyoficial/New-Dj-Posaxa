"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Users, 
  Calendar, 
  MessageSquare, 
  Search, 
  CheckCircle, 
  Clock, 
  XCircle, 
  MoreVertical, 
  Mail, 
  Phone, 
  ChevronRight,
  Music,
  Play,
  Pause,
  Trash2,
  RotateCcw,
  Sparkles,
  RefreshCw,
  Disc,
  Loader2
} from "lucide-react";

export default function AdminPanel() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [reservations, setReservations] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"reservations" | "chats" | "requests">("reservations");
  const [pendingRequestsCount, setPendingRequestsCount] = useState<number>(0);
  const [fetching, setFetching] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [adminError, setAdminError] = useState<string | null>(null);
  
  // States for selection
  const [selectedChatUser, setSelectedChatUser] = useState<string | null>(null);
  const [selectedRes, setSelectedRes] = useState<any | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/auth/login");
      } else {
        checkAdminStatus();
      }
    }
  }, [user, authLoading, router]);

  const checkAdminStatus = async () => {
    setChecking(true);
    const ADMINS = ["newposaxa@gmail.com", "ayoub.louah10@gmail.com", "sigmacompanyoficial@gmail.com"];

    if (user?.email && ADMINS.includes(user.email)) {
      setIsAdmin(true);
      setChecking(false);
      fetchAdminData();
      return;
    }

    try {
      const { data } = await supabase.from("app_admins").select("email").eq("email", user?.email).maybeSingle();
      if (data) {
        setIsAdmin(true);
        fetchAdminData();
      } else {
        router.push("/perfil");
      }
    } catch (err) {
      router.push("/perfil");
    } finally {
      setChecking(false);
    }
  };

  const fetchAdminData = async (isBackground = false) => {
    if (!isBackground) setFetching(true);
    setAdminError(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("Sessio caducada. Torna a iniciar sessio.");
      }

      const response = await fetch("/api/admin/data", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "No s'han pogut carregar les dades admin.");
      }

      setReservations(payload.reservations ?? []);
      setMessages(payload.messages ?? []);
    } catch (err: any) {
      if (!isBackground) {
        setReservations([]);
        setMessages([]);
        setAdminError(err.message);
      }
    } finally {
      if (!isBackground) setFetching(false);
    }
  };

  // Auto-refresh admin reservations and messages every 10 seconds
  useEffect(() => {
    if (!isAdmin) return;
    const interval = setInterval(() => {
      fetchAdminData(true);
    }, 10000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  const updateStatus = async (id: string, status: string) => {
    setAdminError(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("Sessio caducada. Torna a iniciar sessio.");
      }

      const response = await fetch("/api/admin/data", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reservationId: id, status }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "No s'ha pogut actualitzar la reserva.");
      }

      const updatedReservation = payload.reservation;
      setReservations(prev => prev.map(r => r.id === id ? updatedReservation : r));
      if (selectedRes?.id === id) setSelectedRes(updatedReservation);
    } catch (err: any) {
      setAdminError(err.message);
    }

  };

  if (authLoading || checking) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Verificant permisos...</div>;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-20 md:pt-32 px-3 sm:px-6 pb-20">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6 mb-6 md:mb-12">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tighter">Admin Panel</h1>
            <p className="text-gray-500 mt-0.5 uppercase tracking-widest text-[8px] sm:text-[9px] font-bold">Control Central Posaxa</p>
          </div>
          <div className="flex gap-1.5 sm:gap-2 p-1 bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl w-full md:w-auto">
            <button 
              onClick={() => setActiveTab("reservations")}
              className={`flex-1 md:flex-none px-3 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-bold uppercase tracking-wider sm:tracking-widest transition-all ${activeTab === 'reservations' ? 'bg-white text-black shadow-lg shadow-white/10' : 'text-gray-400 hover:text-white'}`}
            >
              Reserves
            </button>
            <button 
              onClick={() => setActiveTab("chats")}
              className={`flex-1 md:flex-none px-3 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-bold uppercase tracking-wider sm:tracking-widest transition-all ${activeTab === 'chats' ? 'bg-white text-black shadow-lg shadow-white/10' : 'text-gray-400 hover:text-white'}`}
            >
              Missatges
            </button>
            <button 
              onClick={() => setActiveTab("requests")}
              className={`flex-1 md:flex-none px-3 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-bold uppercase tracking-wider sm:tracking-widest transition-all flex items-center justify-center gap-1.5 sm:gap-2 ${activeTab === 'requests' ? 'bg-white text-black shadow-lg shadow-white/10' : 'text-gray-400 hover:text-white'}`}
            >
              <Music size={12} />
              <span>Peticions</span>
              {pendingRequestsCount > 0 && (
                <span className="bg-red-500 text-white text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded-full">
                  {pendingRequestsCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {adminError && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-3.5 sm:p-4 text-xs sm:text-sm text-red-300">
            {adminError}
          </div>
        )}

        {/* Content */}
        <div className="bg-white/5 border border-white/10 rounded-2xl sm:rounded-[2rem] md:rounded-[2.5rem] overflow-hidden backdrop-blur-sm min-h-[500px] sm:min-h-[600px]">
          {activeTab === "reservations" ? (
            <div className="flex flex-col">
              {/* Mobile View: Cards */}
              <div className="md:hidden divide-y divide-white/10">
                {fetching && (
                  <div className="p-8 text-center text-gray-500 italic text-xs sm:text-sm">Carregant reserves...</div>
                )}
                {!fetching && reservations.map((res) => (
                  <div key={res.id} className="p-4 flex flex-col gap-3 hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-sm text-white">{res.full_name}</div>
                        <div className="text-[10px] text-gray-400 mt-0.5 flex flex-col gap-0.5">
                          <span className="flex items-center gap-1"><Mail size={10} /> {res.email}</span>
                          <span className="flex items-center gap-1"><Phone size={10} /> {res.phone}</span>
                        </div>
                      </div>
                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md shrink-0 ${
                        res.status === 'pendent' ? 'bg-yellow-500/20 text-yellow-500' : 
                        res.status === 'acceptat' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                      }`}>
                        {res.status}
                      </span>
                    </div>

                    <div className="bg-white/[0.03] p-2.5 rounded-xl text-xs space-y-1">
                      <div className="flex justify-between text-gray-300">
                        <span className="text-gray-500 text-[10px] uppercase font-bold">Lloc:</span>
                        <span className="font-medium truncate max-w-[200px]">{res.location}</span>
                      </div>
                      <div className="flex justify-between text-gray-300">
                        <span className="text-gray-500 text-[10px] uppercase font-bold">Data/Hora:</span>
                        <span className="font-medium">{res.event_date} · {res.event_time}h ({res.duration}h)</span>
                      </div>
                      <div className="flex justify-between text-gray-300">
                        <span className="text-gray-500 text-[10px] uppercase font-bold">Estil:</span>
                        <span className="text-gray-400">{res.music_style}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button 
                        onClick={() => setSelectedRes(res)}
                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5"
                      >
                        <Search size={13} />
                        <span>Detalls</span>
                      </button>
                      <button 
                        onClick={() => updateStatus(res.id, 'rebutjat')}
                        className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5"
                      >
                        <XCircle size={13} />
                        <span>Rebutjar</span>
                      </button>
                      <button 
                        onClick={() => updateStatus(res.id, 'acceptat')}
                        className="px-3 py-1.5 bg-green-500/10 hover:bg-green-500 text-green-400 hover:text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5"
                      >
                        <CheckCircle size={13} />
                        <span>Acceptar</span>
                      </button>
                    </div>
                  </div>
                ))}
                {!fetching && reservations.length === 0 && (
                  <div className="p-8 text-center text-gray-500 italic text-xs sm:text-sm">No s'han trobat reserves</div>
                )}
              </div>

              {/* Desktop View: Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.02]">
                      <th className="p-6 text-[10px] uppercase font-black tracking-widest text-gray-500">Client</th>
                      <th className="p-6 text-[10px] uppercase font-black tracking-widest text-gray-500">Esdeveniment</th>
                      <th className="p-6 text-[10px] uppercase font-black tracking-widest text-gray-500">Data</th>
                      <th className="p-6 text-[10px] uppercase font-black tracking-widest text-gray-500">Estat</th>
                      <th className="p-6 text-[10px] uppercase font-black tracking-widest text-gray-500">Accions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {fetching && (
                      <tr>
                        <td colSpan={5} className="p-12 text-center text-gray-500 italic text-sm">Carregant reserves...</td>
                      </tr>
                    )}
                    {!fetching && reservations.map((res) => (
                      <tr key={res.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="p-6">
                          <div className="font-bold text-sm">{res.full_name}</div>
                          <div className="text-[10px] text-gray-500 mt-1 flex flex-col gap-0.5">
                            <span className="flex items-center gap-1"><Mail size={10} /> {res.email}</span>
                            <span className="flex items-center gap-1"><Phone size={10} /> {res.phone}</span>
                          </div>
                        </td>
                        <td className="p-6">
                          <div className="text-sm font-medium">{res.location}</div>
                          <div className="text-[10px] text-gray-500 uppercase mt-1">{res.music_style}</div>
                        </td>
                        <td className="p-6">
                          <div className="text-sm font-medium">{res.event_date}</div>
                          <div className="text-[10px] text-gray-500">{res.event_time}h ({res.duration}h)</div>
                        </td>
                        <td className="p-6">
                          <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-md ${
                            res.status === 'pendent' ? 'bg-yellow-500/20 text-yellow-500' : 
                            res.status === 'acceptat' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                          }`}>
                            {res.status}
                          </span>
                        </td>
                        <td className="p-6">
                          <div className="flex gap-2">
                            <button 
                              onClick={() => updateStatus(res.id, 'acceptat')}
                              className="p-2.5 bg-green-500/10 text-green-500 rounded-xl hover:bg-green-500 text-white transition-all hover:scale-110 active:scale-95"
                              title="Acceptar"
                            >
                              <CheckCircle size={16} />
                            </button>
                            <button 
                              onClick={() => updateStatus(res.id, 'rebutjat')}
                              className="p-2.5 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 text-white transition-all hover:scale-110 active:scale-95"
                              title="Rebutjar"
                            >
                              <XCircle size={16} />
                            </button>
                            <button 
                              onClick={() => setSelectedRes(res)}
                              className="p-2.5 bg-white/5 text-gray-400 rounded-xl hover:bg-white/10 hover:text-white transition-all"
                              title="Detalls"
                            >
                              <Search size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!fetching && reservations.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-12 text-center text-gray-500 italic text-sm">No s'han trobat reserves</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : activeTab === "chats" ? (
            <ChatInterface 
              messages={messages} 
              onRefresh={fetchAdminData} 
              selectedUser={selectedChatUser}
              setSelectedUser={setSelectedChatUser}
            />
          ) : (
            <SongRequestsAdminView onUpdatePendingCount={setPendingRequestsCount} />
          )}
        </div>
      </div>

      {/* Reservation Details Modal */}
      {selectedRes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#111] border border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            <div className="flex justify-between items-start mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-black uppercase">Detalls de Reserva</h2>
              <button onClick={() => setSelectedRes(null)} className="p-1.5 hover:bg-white/5 rounded-full"><XCircle size={22} /></button>
            </div>
            
            <div className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="text-[9px] sm:text-[10px] uppercase text-gray-500 font-bold">Client</label>
                  <p className="font-bold text-xs sm:text-sm">{selectedRes.full_name}</p>
                </div>
                <div>
                  <label className="text-[9px] sm:text-[10px] uppercase text-gray-500 font-bold">Estat</label>
                  <p className="font-bold uppercase text-xs">
                    <span className={selectedRes.status === 'acceptat' ? 'text-green-500' : selectedRes.status === 'pendent' ? 'text-yellow-500' : 'text-red-500'}>
                      {selectedRes.status}
                    </span>
                  </p>
                </div>
              </div>

              <div>
                <label className="text-[9px] sm:text-[10px] uppercase text-gray-500 font-bold">Esdeveniment i Estil</label>
                <p className="text-xs sm:text-sm">{selectedRes.location} - <span className="text-gray-400">{selectedRes.music_style}</span></p>
              </div>

              <div className="bg-white/5 p-3 sm:p-4 rounded-xl sm:rounded-2xl flex justify-between text-xs sm:text-sm">
                <div>
                  <label className="text-[9px] sm:text-[10px] uppercase text-gray-500 font-bold block">Data</label>
                  <p className="font-bold">{selectedRes.event_date}</p>
                </div>
                <div>
                  <label className="text-[9px] sm:text-[10px] uppercase text-gray-500 font-bold block">Hora</label>
                  <p className="font-bold text-right">{selectedRes.event_time}h</p>
                </div>
              </div>

              <div className="flex gap-2 sm:gap-3 pt-2 sm:pt-4">
                <button 
                  onClick={() => { updateStatus(selectedRes.id, 'acceptat'); }}
                  className="flex-1 bg-green-500 text-white font-bold py-2.5 sm:py-3 rounded-xl hover:bg-green-600 transition-colors uppercase text-[10px] sm:text-xs tracking-wider sm:tracking-widest"
                >
                  Acceptar
                </button>
                <button 
                  onClick={() => { updateStatus(selectedRes.id, 'rebutjat'); }}
                  className="flex-1 bg-red-500 text-white font-bold py-2.5 sm:py-3 rounded-xl hover:bg-red-600 transition-colors uppercase text-[10px] sm:text-xs tracking-wider sm:tracking-widest"
                >
                  Rebutjar
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function ChatInterface({ messages, onRefresh, selectedUser, setSelectedUser }: { 
  messages: any[], 
  onRefresh: () => void,
  selectedUser: string | null,
  setSelectedUser: (id: string | null) => void
}) {
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sendError, setSendError] = useState<string | null>(null);

  // Group messages by user_id
  const chatGroups = messages.reduce((acc, msg) => {
    const uid = msg.user_id;
    if (!acc[uid]) {
      acc[uid] = {
        userId: uid,
        userName: "Usuari",
        lastMessage: msg.message,
        lastDate: msg.created_at,
        messages: []
      };
    }
    if (!msg.is_admin_reply && msg.sender_name && msg.sender_name !== "DJ Posaxa (Admin)") {
      acc[uid].userName = msg.sender_name;
    }
    acc[uid].messages.push(msg);
    return acc;
  }, {} as Record<string, any>);

  const sortedChats = Object.values(chatGroups)
    .filter((chat: any) => chat.userName.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a: any, b: any) => new Date(b.lastDate).getTime() - new Date(a.lastDate).getTime());

  const activeChat = selectedUser ? chatGroups[selectedUser] : null;
  const activeMessages = activeChat ? [...activeChat.messages].sort((a, b) => 
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  ) : [];

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim() || !selectedUser || sending) return;
    setSending(true);
    setSendError(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("Sessio caducada. Torna a iniciar sessio.");
      }

      const response = await fetch("/api/admin/data", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: selectedUser, message: reply }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "No s'ha pogut enviar la resposta.");
      }

      setReply("");
      onRefresh();
    } catch (err: any) {
      setSendError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row flex-1 min-h-[600px]">
      <div className={`w-full md:w-80 border-r border-white/10 flex flex-col ${selectedUser ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-white/10 bg-white/[0.02] space-y-4">
          <h3 className="text-[10px] uppercase font-black tracking-widest text-gray-500">Converses</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
            <input 
              type="text" 
              placeholder="Cercar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-white/20"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {sortedChats.map((chat: any) => (
            <button 
              key={chat.userId}
              onClick={() => setSelectedUser(chat.userId)}
              className={`w-full p-4 flex flex-col gap-1 text-left transition-colors border-b border-white/5 ${selectedUser === chat.userId ? 'bg-white/10' : 'hover:bg-white/[0.05]'}`}
            >
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm truncate">{chat.userName}</span>
                <span className="text-[9px] text-gray-500 shrink-0">{new Date(chat.lastDate).toLocaleDateString()}</span>
              </div>
              <p className="text-xs text-gray-400 truncate">{chat.lastMessage}</p>
            </button>
          ))}
        </div>
      </div>

      <div className={`flex-1 flex flex-col bg-black/20 ${!selectedUser ? 'hidden md:flex' : 'flex'}`}>
        {activeChat ? (
          <>
            <div className="p-4 border-b border-white/10 flex items-center gap-3 bg-white/[0.02]">
              <button onClick={() => setSelectedUser(null)} className="md:hidden p-2"><ChevronRight className="rotate-180" size={20} /></button>
              <h3 className="font-bold text-sm">{activeChat.userName}</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
              {activeMessages.map((msg: any) => (
                <div key={msg.id} className={`flex ${msg.is_admin_reply ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] md:max-w-[80%] p-3 md:p-4 rounded-2xl text-xs md:text-sm ${
                    msg.is_admin_reply ? 'bg-white text-black rounded-tr-none font-medium shadow-xl' : 'bg-white/10 rounded-tl-none border border-white/5'
                  }`}>
                    <p className="leading-relaxed">{msg.message}</p>
                    <span className={`text-[8px] md:text-[9px] mt-1 block opacity-50 ${msg.is_admin_reply ? 'text-black' : 'text-white'}`}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handleSendReply} className="p-3 md:p-4 bg-black/40 border-t border-white/10 flex gap-2">
              {sendError && (
                <p className="absolute -mt-8 text-[10px] text-red-300">{sendError}</p>
              )}
              <input 
                type="text" 
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Resposta..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/30"
              />
              <button type="submit" disabled={sending} className="bg-white text-black px-6 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:scale-105 active:scale-95 transition-all">
                {sending ? '...' : 'Enviar'}
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-40">
            <MessageSquare size={48} className="mb-4" />
            <p className="text-sm uppercase tracking-widest font-black">Selecciona un Xat</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: any, label: string, value: any }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-white/5 rounded-lg">{icon}</div>
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{label}</span>
      </div>
      <div className="text-3xl font-black">{value}</div>
    </div>
  );
}

function SongRequestsAdminView({ onUpdatePendingCount }: { onUpdatePendingCount: (count: number) => void }) {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "played" | "rejected">("all");
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [buffering, setBuffering] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sync pending count to parent whenever requests list changes
  // (must be in useEffect, never inside a setState callback)
  useEffect(() => {
    const pending = requests.filter((r) => r.status === "pending").length;
    onUpdatePendingCount(pending);
  }, [requests, onUpdatePendingCount]);

  const fetchRequests = async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      setActionError(null);
      const res = await fetch("/api/song-requests");
      const data = await res.json();
      const list = data.requests || [];
      setRequests(list);
    } catch (e: any) {
      if (!isBackground) setActionError(e.message || "Error carregant peticions");
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    
    // Initialize admin audio element
    if (!audioRef.current && typeof window !== "undefined") {
      const audio = new Audio();
      audio.preload = "auto";
      audio.crossOrigin = "anonymous";
      audio.onwaiting = () => setBuffering(true);
      audio.onplaying = () => setBuffering(false);
      audio.oncanplay = () => setBuffering(false);
      audio.onended = () => {
        setPlayingId(null);
        setBuffering(false);
      };
      audio.onerror = () => {
        setPlayingId(null);
        setBuffering(false);
        setActionError("No s'ha pogut reproduir l'àudio d'aquesta cançó.");
        setTimeout(() => setActionError(null), 3000);
      };
      audioRef.current = audio;
    }

    // Auto-refresh song requests every 10 seconds
    const interval = setInterval(() => fetchRequests(true), 10000);
    return () => {
      clearInterval(interval);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  const updateStatus = async (id: string, status: "pending" | "played" | "rejected") => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }

      const res = await fetch("/api/song-requests", {
        method: "PATCH",
        headers,
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
      } else {
        const errData = await res.json();
        throw new Error(errData.error || "Error en actualitzar la petició");
      }
    } catch (e: any) {
      setActionError(e.message);
    }
  };

  const deleteRequest = async (id: string) => {
    if (!confirm("Segur que vols eliminar aquesta petició?")) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = {};
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }

      const res = await fetch(`/api/song-requests?id=${id}`, {
        method: "DELETE",
        headers,
      });
      if (res.ok) {
        setRequests((prev) => prev.filter((r) => r.id !== id));
      } else {
        const errData = await res.json();
        throw new Error(errData.error || "Error en eliminar la petició");
      }
    } catch (e: any) {
      setActionError(e.message);
    }
  };

  const togglePreview = async (id: string, previewUrl: string | null) => {
    if (!previewUrl) {
      setActionError("Aquesta cançó no conté enllaç d'àudio de preview.");
      setTimeout(() => setActionError(null), 3000);
      return;
    }

    if (playingId === id) {
      if (audioRef.current) audioRef.current.pause();
      setPlayingId(null);
      setBuffering(false);
    } else {
      try {
        if (!audioRef.current) {
          audioRef.current = new Audio();
        }
        audioRef.current.pause();
        audioRef.current.src = previewUrl;
        audioRef.current.load();
        setPlayingId(id);
        setBuffering(true);
        await audioRef.current.play();
        setBuffering(false);
      } catch (err) {
        console.error("Audio playback error:", err);
        setPlayingId(null);
        setBuffering(false);
        setActionError("Error en reproduir l'àudio en aquest navegador.");
        setTimeout(() => setActionError(null), 3000);
      }
    }
  };

  const filteredRequests = requests.filter((req) => {
    const matchesFilter = filter === "all" || req.status === filter;
    const matchesSearch =
      search.trim() === "" ||
      req.song_title?.toLowerCase().includes(search.toLowerCase()) ||
      req.artist_name?.toLowerCase().includes(search.toLowerCase()) ||
      req.requester_name?.toLowerCase().includes(search.toLowerCase()) ||
      req.notes?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const playedCount = requests.filter((r) => r.status === "played").length;
  const rejectedCount = requests.filter((r) => r.status === "rejected").length;

  return (
    <div className="flex flex-col p-3.5 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
      {/* Top Stats and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 sm:pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 sm:gap-3">
            <h2 className="text-lg sm:text-xl md:text-2xl font-black uppercase tracking-tight text-white flex items-center gap-1.5 sm:gap-2">
              <Music size={18} className="text-red-500 shrink-0 sm:w-[22px] sm:h-[22px]" />
              <span>Peticions de Cançons</span>
            </h2>
            <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] text-green-400 font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-green-500/10 border border-green-500/25 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping" />
              Live
            </span>
          </div>
          <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider sm:tracking-widest font-bold mt-0.5 sm:mt-1">
            {requests.length} totals • {pendingCount} pendents • Auto-refresh 10s
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => fetchRequests(false)}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
          >
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
            <span>Refrescar</span>
          </button>
        </div>
      </div>

      {actionError && (
        <div className="p-3 sm:p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-xs">
          {actionError}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 sm:gap-4">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
              filter === "all" ? "bg-white text-black font-black shadow-lg shadow-white/10" : "bg-white/5 text-gray-400 hover:text-white"
            }`}
          >
            Totes ({requests.length})
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1 sm:gap-1.5 whitespace-nowrap ${
              filter === "pending" ? "bg-yellow-500 text-black font-black" : "bg-white/5 text-yellow-400 hover:bg-yellow-500/20"
            }`}
          >
            <Clock size={11} />
            <span>Pendents ({pendingCount})</span>
          </button>
          <button
            onClick={() => setFilter("played")}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1 sm:gap-1.5 whitespace-nowrap ${
              filter === "played" ? "bg-green-500 text-white font-black" : "bg-white/5 text-green-400 hover:bg-green-500/20"
            }`}
          >
            <CheckCircle size={11} />
            <span>Sonades ({playedCount})</span>
          </button>
          <button
            onClick={() => setFilter("rejected")}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1 sm:gap-1.5 whitespace-nowrap ${
              filter === "rejected" ? "bg-red-500 text-white font-black" : "bg-white/5 text-red-400 hover:bg-red-500/20"
            }`}
          >
            <XCircle size={11} />
            <span>Rebutjades ({rejectedCount})</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cercar petició o artista..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
          />
        </div>
      </div>

      {/* Requests List */}
      {loading && requests.length === 0 ? (
        <div className="py-16 text-center text-gray-500 text-xs sm:text-sm italic">
          Carregant peticions de cançons...
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="py-16 text-center text-gray-500 text-xs sm:text-sm">
          No s'ha trobat cap petició amb els filtres seleccionats.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2.5 sm:gap-3">
          {filteredRequests.map((req) => (
            <div
              key={req.id}
              className={`p-3 sm:p-5 rounded-xl sm:rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 ${
                req.status === "pending"
                  ? "bg-white/[0.04] border-white/15 hover:border-white/30"
                  : req.status === "played"
                  ? "bg-green-500/[0.03] border-green-500/20 opacity-75"
                  : "bg-red-500/[0.03] border-red-500/20 opacity-60"
              }`}
            >
              {/* Song info */}
              <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1 w-full">
                {req.album_art ? (
                  <img
                    src={req.album_art}
                    alt={req.song_title}
                    className="w-11 h-11 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl object-cover border border-white/10 shrink-0"
                  />
                ) : (
                  <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-white/10 flex items-center justify-center text-gray-400 shrink-0">
                    <Music size={20} />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <h4 className="font-bold text-xs sm:text-base text-white truncate max-w-[200px] sm:max-w-none">
                      {req.song_title}
                    </h4>
                    <span
                      className={`text-[8px] sm:text-[9px] font-black uppercase px-1.5 py-0.2 sm:px-2 sm:py-0.5 rounded-full ${
                        req.status === "played"
                          ? "bg-green-500/20 text-green-400 border border-green-500/30"
                          : req.status === "rejected"
                          ? "bg-red-500/20 text-red-400 border border-red-500/30"
                          : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                      }`}
                    >
                      {req.status === "played" ? "Reproduïda" : req.status === "rejected" ? "Rebutjada" : "Pendent"}
                    </span>
                  </div>

                  <p className="text-[11px] sm:text-xs text-gray-300 font-medium truncate mt-0.5">
                    {req.artist_name}
                  </p>

                  <div className="flex items-center gap-2 text-[10px] sm:text-[11px] text-gray-400 mt-1 flex-wrap">
                    <span>
                      Per: <strong className="text-white">{req.requester_name || "Anònim"}</strong>
                    </span>
                    {req.notes && (
                      <span className="italic text-gray-300 truncate max-w-[140px] sm:max-w-none">
                        • "{req.notes}"
                      </span>
                    )}
                    <span className="text-gray-500">
                      • {new Date(req.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 self-end sm:self-center">
                {req.preview_url && (
                  <button
                    onClick={() => togglePreview(req.id, req.preview_url)}
                    className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl border transition-all ${
                      playingId === req.id 
                        ? "bg-white text-black border-white" 
                        : "bg-white/10 hover:bg-white/20 text-white border-white/10"
                    }`}
                    title={playingId === req.id ? "Pausar preview" : "Escoltar 30s preview"}
                  >
                    {playingId === req.id && buffering ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : playingId === req.id ? (
                      <Pause size={14} />
                    ) : (
                      <Play size={14} />
                    )}
                  </button>
                )}

                {req.status !== "played" && (
                  <button
                    onClick={() => updateStatus(req.id, "played")}
                    className="px-2.5 sm:px-3.5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl bg-green-500/15 hover:bg-green-500 text-green-400 hover:text-white border border-green-500/30 text-[11px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-all"
                    title="Marcar com a reproduïda"
                  >
                    <CheckCircle size={13} />
                    <span>Sonant</span>
                  </button>
                )}

                {req.status === "played" && (
                  <button
                    onClick={() => updateStatus(req.id, "pending")}
                    className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white transition-colors"
                    title="Tornar a posar com a pendent"
                  >
                    <RotateCcw size={14} />
                  </button>
                )}

                {req.status !== "rejected" && (
                  <button
                    onClick={() => updateStatus(req.id, "rejected")}
                    className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white transition-colors"
                    title="Rebutjar petició"
                  >
                    <XCircle size={14} />
                  </button>
                )}

                <button
                  onClick={() => deleteRequest(req.id)}
                  className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-white/5 hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors"
                  title="Eliminar de la llista"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
