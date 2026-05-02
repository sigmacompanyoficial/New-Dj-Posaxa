"use client";

import { useEffect, useState } from "react";
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
  ChevronRight
} from "lucide-react";

export default function AdminPanel() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [reservations, setReservations] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"reservations" | "chats">("reservations");
  const [fetching, setFetching] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  
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

  const fetchAdminData = async () => {
    setFetching(true);
    const { data: resData } = await supabase.from("reservations").select("*").order("created_at", { ascending: false });
    if (resData) setReservations(resData);

    const { data: msgData } = await supabase.from("messages").select("*").order("created_at", { ascending: false });
    if (msgData) setMessages(msgData);
    setFetching(false);
  };

  const updateStatus = async (id: string, status: string) => {
    const reservation = reservations.find(r => r.id === id);
    const { error } = await supabase.from("reservations").update({ status }).eq("id", id);
    
    if (!error && reservation) {
      // Update local state for immediate feedback
      setReservations(prev => prev.map(r => r.id === id ? { ...r, status } : r));
      if (selectedRes?.id === id) setSelectedRes({ ...selectedRes, status });

      // Enviar notificació push a l'usuari
      try {
        const { data: tokenData } = await supabase
          .from("user_fcm_tokens")
          .select("token")
          .eq("user_id", reservation.user_id)
          .single();

        if (tokenData?.token) {
          const title = status === "acceptat" ? "Reserva Confirmada! ✅" : "Estat de la Reserva ❌";
          const body = status === "acceptat" 
            ? `Bones notícies! La teva reserva per al ${reservation.event_date} ha estat acceptada.`
            : `Ho sentim, la teva reserva per al ${reservation.event_date} ha estat rebutjada.`;

          await fetch("/api/send-notification", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              token: tokenData.token,
              title,
              body,
            }),
          });
        }
      } catch (err) {
        console.error("Error enviant notificació de reserva:", err);
      }
    }
  };

  if (authLoading || checking) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Verificant permisos...</div>;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 md:pt-32 px-4 md:px-6 pb-20">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 md:mb-12">
          <div>
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">Admin Panel</h1>
            <p className="text-gray-500 mt-1 uppercase tracking-widest text-[9px] font-bold">Control Central Posaxa</p>
          </div>
          <div className="flex gap-2 p-1 bg-white/5 border border-white/10 rounded-2xl w-full md:w-auto">
            <button 
              onClick={() => setActiveTab("reservations")}
              className={`flex-1 md:flex-none px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'reservations' ? 'bg-white text-black shadow-lg shadow-white/10' : 'text-gray-400 hover:text-white'}`}
            >
              Reserves
            </button>
            <button 
              onClick={() => setActiveTab("chats")}
              className={`flex-1 md:flex-none px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'chats' ? 'bg-white text-black shadow-lg shadow-white/10' : 'text-gray-400 hover:text-white'}`}
            >
              Missatges
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white/5 border border-white/10 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden backdrop-blur-sm min-h-[600px]">
          {activeTab === "reservations" ? (
            <div className="flex flex-col">
              <div className="overflow-x-auto">
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
                    {reservations.map((res) => (
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
                    {reservations.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-12 text-center text-gray-500 italic text-sm">No s'han trobat reserves</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <ChatInterface 
              messages={messages} 
              onRefresh={fetchAdminData} 
              selectedUser={selectedChatUser}
              setSelectedUser={setSelectedChatUser}
            />
          )}
        </div>
      </div>

      {/* Reservation Details Modal */}
      {selectedRes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#111] border border-white/10 rounded-3xl p-8 max-w-lg w-full shadow-2xl"
          >
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-black uppercase">Detalls de Reserva</h2>
              <button onClick={() => setSelectedRes(null)} className="p-2 hover:bg-white/5 rounded-full"><XCircle size={24} /></button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase text-gray-500 font-bold">Client</label>
                  <p className="font-bold">{selectedRes.full_name}</p>
                </div>
                <div>
                  <label className="text-[10px] uppercase text-gray-500 font-bold">Estat</label>
                  <p className="font-bold uppercase text-xs">
                    <span className={selectedRes.status === 'acceptat' ? 'text-green-500' : selectedRes.status === 'pendent' ? 'text-yellow-500' : 'text-red-500'}>
                      {selectedRes.status}
                    </span>
                  </p>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase text-gray-500 font-bold">Esdeveniment i Estil</label>
                <p className="text-sm">{selectedRes.location} - <span className="text-gray-400">{selectedRes.music_style}</span></p>
              </div>

              <div className="bg-white/5 p-4 rounded-2xl flex justify-between">
                <div>
                  <label className="text-[10px] uppercase text-gray-500 font-bold block">Data</label>
                  <p className="font-bold">{selectedRes.event_date}</p>
                </div>
                <div>
                  <label className="text-[10px] uppercase text-gray-500 font-bold block">Hora</label>
                  <p className="font-bold text-right">{selectedRes.event_time}h</p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => { updateStatus(selectedRes.id, 'acceptat'); }}
                  className="flex-1 bg-green-500 text-white font-bold py-3 rounded-xl hover:bg-green-600 transition-colors uppercase text-xs tracking-widest"
                >
                  Acceptar
                </button>
                <button 
                  onClick={() => { updateStatus(selectedRes.id, 'rebutjat'); }}
                  className="flex-1 bg-red-500 text-white font-bold py-3 rounded-xl hover:bg-red-600 transition-colors uppercase text-xs tracking-widest"
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

    // 1. Guardar el mensaje en la base de datos
    const { error } = await supabase.from("messages").insert([{
      user_id: selectedUser,
      sender_name: "DJ Posaxa (Admin)",
      message: reply,
      is_admin_reply: true
    }]);

    if (!error) {
      // 2. Intentar enviar notificación push
      try {
        // Obtener el token FCM del usuario destinatario
        const { data: tokenData } = await supabase
          .from("user_fcm_tokens")
          .select("token")
          .eq("user_id", selectedUser)
          .single();

        if (tokenData?.token) {
          await fetch("/api/send-notification", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              token: tokenData.token,
              title: "Nou missatge de DJ Posaxa",
              body: reply.substring(0, 50) + (reply.length > 50 ? "..." : ""),
            }),
          });
        }
      } catch (err) {
        console.error("Error enviando notificación push:", err);
      }

      setReply("");
      onRefresh();
    }
    setSending(false);
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
