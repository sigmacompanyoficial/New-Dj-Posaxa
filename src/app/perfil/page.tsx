"use client";

import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User as UserIcon, 
  LogOut, 
  Settings, 
  Bell, 
  Calendar, 
  MessageSquare, 
  Lock,
  ChevronRight,
  Clock,
  MapPin,
  Globe
} from "lucide-react";

export default function PerfilPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050505] flex items-center justify-center"><div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div></div>}>
      <PerfilContent />
    </Suspense>
  );
}

function PerfilContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as any) || "activity";
  
  const [activeTab, setActiveTab] = useState<"activity" | "reservations" | "chat" | "settings">(initialTab);
  const [reservations, setReservations] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [fetchingData, setFetchingData] = useState(false);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && (tab === "activity" || tab === "reservations" || tab === "chat" || tab === "settings")) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    } else if (user) {
      fetchUserData();
    }
  }, [user, loading, router]);

  const fetchUserData = async () => {
    setFetchingData(true);
    // Fetch reservations
    const { data: resData } = await supabase
      .from("reservations")
      .select("*")
      .eq("user_id", user?.id)
      .order("created_at", { ascending: false });
    
    if (resData) setReservations(resData);

    // Fetch messages
    const { data: msgData } = await supabase
      .from("messages")
      .select("*")
      .eq("user_id", user?.id)
      .order("created_at", { ascending: true });
    
    if (msgData) setMessages(msgData);
    setFetchingData(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const { error } = await supabase.from("messages").insert([
      {
        user_id: user?.id,
        sender_name: user?.user_metadata?.full_name || user?.email,
        message: newMessage,
        is_admin_reply: false
      }
    ]);

    if (!error) {
      setNewMessage("");
      fetchUserData();
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] pt-24 md:pt-32 pb-20 px-4 md:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          
          {/* Sidebar / Profile Card */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full lg:w-1/3 bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-md lg:sticky lg:top-32"
          >
            <div className="flex flex-row lg:flex-col items-center gap-4 lg:gap-0 mb-6 lg:mb-0">
              <div className="w-16 h-16 lg:w-24 lg:h-24 bg-gradient-to-tr from-gray-700 to-gray-400 rounded-full flex items-center justify-center lg:mb-6 shadow-[0_0_30px_rgba(255,255,255,0.1)] shrink-0">
                <UserIcon size={30} className="text-white/50 lg:hidden" />
                <UserIcon size={40} className="text-white/50 hidden lg:block" />
              </div>
              
              <div className="text-left lg:text-center overflow-hidden">
                <h2 className="text-lg lg:text-xl font-bold mb-1 truncate">
                  {user.user_metadata?.full_name || user.email?.split("@")[0]}
                </h2>
                <p className="text-gray-500 text-xs lg:text-sm truncate">{user.email}</p>
              </div>
            </div>

            <nav className="w-full flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 no-scrollbar">
              {/* ADMIN BUTTON (Only for authorized emails) */}
              {(user.email === "newposaxa@gmail.com" || 
                user.email === "ayoub.louah10@gmail.com" || 
                user.email === "sigmacompanyoficial@gmail.com") && (
                <button 
                  onClick={() => router.push("/admin")}
                  className="shrink-0 lg:w-full flex items-center gap-3 bg-gradient-to-r from-yellow-600 to-yellow-400 text-black px-4 py-3 lg:p-4 rounded-2xl transition-all font-black text-[10px] lg:text-[11px] uppercase tracking-[1px] lg:tracking-[2px] lg:mb-4 shadow-[0_0_20px_rgba(202,138,4,0.3)] hover:scale-105 active:scale-95"
                >
                  <Lock size={16} className="lg:w-[18px] lg:h-[18px]" /> <span className="hidden sm:inline lg:inline">Panell d'Admin</span><span className="sm:hidden lg:hidden">Admin</span>
                </button>
              )}

              <TabButton 
                active={activeTab === "activity"} 
                onClick={() => setActiveTab("activity")}
                icon={<Bell size={18} />} 
                label="Activitat" 
              />
              <TabButton 
                active={activeTab === "reservations"} 
                onClick={() => setActiveTab("reservations")}
                icon={<Calendar size={18} />} 
                label="Reserves" 
                badge={reservations.length > 0 ? reservations.length : undefined}
              />
              <TabButton 
                active={activeTab === "chat"} 
                onClick={() => setActiveTab("chat")}
                icon={<MessageSquare size={18} />} 
                label="Xat" 
              />
              <TabButton 
                active={activeTab === "settings"} 
                onClick={() => setActiveTab("settings")}
                icon={<Settings size={18} />} 
                label="Ajustos" 
              />
              <button 
                onClick={handleLogout}
                className="shrink-0 lg:w-full flex items-center gap-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 px-4 py-3 lg:p-4 rounded-2xl transition-colors text-xs lg:text-sm font-bold lg:mt-4"
              >
                <LogOut size={16} className="lg:w-[18px] lg:h-[18px]" /> <span className="hidden sm:inline lg:inline">Sortir</span>
              </button>
            </nav>
          </motion.div>

          {/* Main Content Area */}
          <div className="w-full lg:w-2/3">
            <AnimatePresence mode="wait">
              {activeTab === "activity" && (
                <motion.div 
                  key="activity"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4 md:space-y-6"
                >
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8">
                    <h3 className="text-xl md:text-2xl font-black uppercase mb-4 md:mb-6">Benvingut de nou</h3>
                    <p className="text-gray-400 font-light leading-relaxed text-sm md:text-base">
                      Aquí trobaràs tota la teva interacció amb DJ Posaxa. Gestiona les teves sol·licituds de pressupost o parla directament amb en Pol per als detalls del teu esdeveniment.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                    <div className="bg-gradient-to-br from-white/10 to-transparent border border-white/10 rounded-3xl p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-white/10 rounded-xl text-white">
                          <Calendar size={20} />
                        </div>
                        <span className="font-bold uppercase tracking-widest text-[10px]">Properes Festes</span>
                      </div>
                      <p className="text-2xl font-black">{reservations.filter(r => r.status === 'acceptat').length}</p>
                      <p className="text-gray-500 text-xs mt-1">Reserves confirmades</p>
                    </div>
                    <div className="bg-gradient-to-br from-white/10 to-transparent border border-white/10 rounded-3xl p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-white/10 rounded-xl text-white">
                          <MessageSquare size={20} />
                        </div>
                        <span className="font-bold uppercase tracking-widest text-[10px]">Missatges</span>
                      </div>
                      <p className="text-2xl font-black">{messages.length}</p>
                      <p className="text-gray-500 text-xs mt-1">En la conversa actual</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "reservations" && (
                <motion.div 
                  key="reservations"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <h3 className="text-xl md:text-2xl font-black uppercase px-2">Les Meves Reserves</h3>
                  {fetchingData ? (
                    <div className="py-12 text-center text-gray-500">Carregant reserves...</div>
                  ) : reservations.length === 0 ? (
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 text-center">
                      <Calendar size={40} className="mx-auto mb-4 text-gray-600" />
                      <p className="text-gray-400 mb-6 text-sm">Encara no has realitzat cap sol·licitud de pressupost.</p>
                      <button 
                        onClick={() => router.push("/preus")}
                        className="bg-white text-black px-6 py-3 rounded-full font-bold uppercase tracking-widest text-[10px]"
                      >
                        Anar a Preus
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reservations.map((res) => (
                        <div key={res.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div className="w-full">
                            <div className="flex items-center justify-between md:justify-start gap-3 mb-2">
                              <span className={`text-[9px] uppercase font-black px-2 py-1 rounded ${
                                res.status === 'pendent' ? 'bg-yellow-500/20 text-yellow-500' : 
                                res.status === 'acceptat' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                              }`}>
                                {res.status}
                              </span>
                              <span className="text-[10px] text-gray-500">{new Date(res.created_at).toLocaleDateString()}</span>
                            </div>
                            <h4 className="text-base md:text-lg font-bold truncate">{res.location}</h4>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                              <div className="flex items-center gap-1 text-[11px] text-gray-400">
                                <Clock size={12} /> {res.event_date} - {res.event_time}h
                              </div>
                              <div className="flex items-center gap-1 text-[11px] text-gray-400">
                                <MapPin size={12} /> {res.location}
                              </div>
                            </div>
                          </div>
                          <button className="hidden md:block text-white/40 hover:text-white transition-colors">
                            <ChevronRight size={20} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "chat" && (
                <motion.div 
                  key="chat"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-col h-[500px] md:h-[600px] bg-white/5 border border-white/10 rounded-3xl overflow-hidden"
                >
                  <div className="p-4 md:p-6 border-b border-white/10 bg-white/5 flex items-center justify-between shrink-0">
                    <h3 className="font-black uppercase tracking-widest text-[11px] md:text-sm">Xat amb en Pol</h3>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-[9px] text-gray-400 uppercase font-bold">Online</span>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                    {messages.length === 0 && (
                      <div className="h-full flex items-center justify-center text-center px-6 md:px-12">
                        <p className="text-gray-500 text-xs md:text-sm">
                          Envia un missatge per començar la conversa. En Pol et respondrà aquí mateix.
                        </p>
                      </div>
                    )}
                    {messages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.is_admin_reply ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-[85%] md:max-w-[80%] p-3 md:p-4 rounded-2xl text-xs md:text-sm ${
                          msg.is_admin_reply ? 'bg-white/10 rounded-tl-none' : 'bg-white text-black rounded-tr-none font-medium'
                        }`}>
                          <p className="leading-relaxed">{msg.message}</p>
                          <span className={`text-[8px] md:text-[9px] mt-1 block opacity-50 ${msg.is_admin_reply ? 'text-white' : 'text-black'}`}>
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleSendMessage} className="p-3 md:p-4 bg-black/40 border-t border-white/10 flex gap-2 shrink-0">
                    <input 
                      type="text" 
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Escriu..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs md:text-sm focus:outline-none focus:border-white/30"
                    />
                    <button 
                      type="submit"
                      className="bg-white text-black p-3 rounded-xl hover:scale-105 active:scale-95 transition-all"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </form>
                </motion.div>
              )}

              {activeTab === "settings" && (
                <motion.div 
                  key="settings"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <h3 className="text-xl md:text-2xl font-black uppercase px-2">Ajustos</h3>
                  
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 space-y-8">
                    {/* Change Password */}
                    <div>
                      <div className="flex items-center gap-3 mb-6">
                        <Lock size={18} className="text-gray-400" />
                        <h4 className="font-bold uppercase tracking-widest text-[11px] md:text-sm">Contrasenya</h4>
                      </div>
                      <form className="space-y-4 max-w-sm">
                        <input 
                          type="password" 
                          placeholder="Nova contrasenya" 
                          className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-white/40"
                        />
                        <input 
                          type="password" 
                          placeholder="Confirmar" 
                          className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-white/40"
                        />
                        <button className="bg-white text-black px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:scale-[1.02] active:scale-95 transition-all">
                          Actualitzar
                        </button>
                      </form>
                    </div>

                    <hr className="border-white/5" />

                    {/* Notifications Settings */}
                    <div>
                      <div className="flex items-center gap-3 mb-6">
                        <Bell size={18} className="text-gray-400" />
                        <h4 className="font-bold uppercase tracking-widest text-[11px] md:text-sm">Notificacions</h4>
                      </div>
                      <div className="space-y-4">
                        {[
                          { id: 'email_notif', label: 'Notificacions per Email', desc: 'Rebre avisos sobre reserves i missatges.' },
                          { id: 'push_notif', label: 'Notificacions Push', desc: 'Alertes en temps real al teu navegador.' },
                        ].map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl">
                            <div>
                              <p className="text-xs font-bold uppercase tracking-widest mb-1">{item.label}</p>
                              <p className="text-[10px] text-gray-500 uppercase">{item.desc}</p>
                            </div>
                            <div className="w-10 h-5 bg-white/10 rounded-full relative cursor-pointer">
                              <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <hr className="border-white/5" />

                    {/* Privacy Settings */}
                    <div>
                      <div className="flex items-center gap-3 mb-6">
                        <Lock size={18} className="text-gray-400" />
                        <h4 className="font-bold uppercase tracking-widest text-[11px] md:text-sm">Privacitat</h4>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-widest mb-1">Perfil Públic</p>
                            <p className="text-[10px] text-gray-500 uppercase">Permetre que altres vegin el teu perfil.</p>
                          </div>
                          <div className="w-10 h-5 bg-white/10 rounded-full relative cursor-pointer">
                            <div className="absolute left-1 top-1 w-3 h-3 bg-white/30 rounded-full"></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <hr className="border-white/5" />

                    {/* Language Settings */}
                    <div>
                      <div className="flex items-center gap-3 mb-6">
                        <Globe size={18} className="text-gray-400" />
                        <h4 className="font-bold uppercase tracking-widest text-[11px] md:text-sm">Idioma</h4>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[
                          { code: 'ca', name: 'Català', flag: '🇦🇩' },
                          { code: 'es', name: 'Castellano', flag: '🇪🇸' },
                          { code: 'en', name: 'English', flag: '🇬🇧' },
                          { code: 'fr', name: 'Français', flag: '🇫🇷' },
                          { code: 'ar', name: 'العربية', flag: '🇲🇦' },
                        ].map((lang) => (
                          <button
                            key={lang.code}
                            className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                              lang.code === 'ca' 
                                ? 'bg-white text-black border-white' 
                                : 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-400'
                            }`}
                          >
                            <span className="text-sm font-bold">{lang.name}</span>
                            <span className="text-xl">{lang.flag}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <hr className="border-white/5" />

                    {/* Danger Zone */}
                    <div>
                      <h4 className="font-bold uppercase tracking-widest text-[10px] md:text-xs text-red-500/50 mb-4">Zona de Perill</h4>
                      <button className="text-red-500/50 text-[10px] hover:text-red-500 transition-colors uppercase tracking-widest font-bold">
                        Eliminar Compte
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label, badge }: { active: boolean, onClick: () => void, icon: any, label: string, badge?: number }) {
  return (
    <button 
      onClick={onClick}
      className={`shrink-0 lg:w-full flex items-center justify-between px-4 py-3 lg:p-4 rounded-2xl transition-all duration-300 ${
        active ? 'bg-white text-black' : 'bg-white/5 hover:bg-white/10 text-gray-400'
      }`}
    >
      <div className="flex items-center gap-2 lg:gap-3">
        <span className="shrink-0">{icon}</span>
        <span className="text-sm font-bold uppercase tracking-widest text-[10px] lg:text-[11px]">{label}</span>
      </div>
      {badge && (
        <span className={`ml-2 text-[9px] lg:text-[10px] font-black px-2 py-0.5 rounded-full ${active ? 'bg-black text-white' : 'bg-white/10 text-white'}`}>
          {badge}
        </span>
      )}
    </button>
  );
}
