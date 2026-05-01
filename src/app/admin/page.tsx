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
  Phone
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
    
    // LLISTA D'ADMINS AUTORITZATS
    const ADMINS = [
      "newposaxa@gmail.com",
      "ayoub.louah10@gmail.com",
      "sigmacompanyoficial@gmail.com"
    ];

    if (user?.email && ADMINS.includes(user.email)) {
      setIsAdmin(true);
      setChecking(false);
      fetchAdminData();
      return;
    }

    // 2. COMPROVACIÓ PER BASE DE DADES (Taula app_admins)
    try {
      const { data, error } = await supabase
        .from("app_admins")
        .select("email")
        .eq("email", user?.email)
        .maybeSingle();
      
      if (data) {
        setIsAdmin(true);
        fetchAdminData();
      } else {
        router.push("/perfil");
      }
    } catch (err) {
      console.error("Auth check failed:", err);
      router.push("/perfil");
    } finally {
      setChecking(false);
    }
  };

  const fetchAdminData = async () => {
    setFetching(true);
    const { data: resData } = await supabase
      .from("reservations")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (resData) setReservations(resData);

    const { data: msgData } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (msgData) setMessages(msgData);
    setFetching(false);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("reservations")
      .update({ status })
      .eq("id", id);
    
    if (!error) fetchAdminData();
  };

  if (authLoading || checking) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Verificant permisos...</div>;

  if (!isAdmin) return null; // No mostris res si no és admin

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-32 px-6 pb-20">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter">Panell de Control</h1>
            <p className="text-gray-500 mt-1 uppercase tracking-widest text-[10px] font-bold">Gestió d'Esdeveniments i Clients</p>
          </div>
          <div className="flex gap-2 p-1 bg-white/5 border border-white/10 rounded-2xl">
            <button 
              onClick={() => setActiveTab("reservations")}
              className={`px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'reservations' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
            >
              Reserves
            </button>
            <button 
              onClick={() => setActiveTab("chats")}
              className={`px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'chats' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
            >
              Missatges
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <StatCard icon={<Calendar className="text-blue-400" />} label="Reserves Totals" value={reservations.length} />
          <StatCard icon={<Clock className="text-yellow-400" />} label="Pendent" value={reservations.filter(r => r.status === 'pendent').length} />
          <StatCard icon={<CheckCircle className="text-green-400" />} label="Confirmades" value={reservations.filter(r => r.status === 'acceptat').length} />
          <StatCard icon={<MessageSquare className="text-purple-400" />} label="Xats Actius" value={new Set(messages.map(m => m.user_id)).size} />
        </div>

        {/* Content */}
        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden backdrop-blur-sm">
          {activeTab === "reservations" ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02]">
                    <th className="p-6 text-[10px] uppercase font-black tracking-widest text-gray-500">Client</th>
                    <th className="p-6 text-[10px] uppercase font-black tracking-widest text-gray-500">Esdeveniment</th>
                    <th className="p-6 text-[10px] uppercase font-black tracking-widest text-gray-500">Data i Hora</th>
                    <th className="p-6 text-[10px] uppercase font-black tracking-widest text-gray-500">Estat</th>
                    <th className="p-6 text-[10px] uppercase font-black tracking-widest text-gray-500">Accions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {reservations.map((res) => (
                    <tr key={res.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-6">
                        <div className="font-bold">{res.full_name}</div>
                        <div className="text-xs text-gray-500 mt-1 flex flex-col gap-1">
                          <span className="flex items-center gap-1"><Mail size={10} /> {res.email}</span>
                          <span className="flex items-center gap-1"><Phone size={10} /> {res.phone}</span>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="text-sm font-medium">{res.location}</div>
                        <div className="text-[10px] text-gray-500 uppercase mt-1">{res.music_style}</div>
                      </td>
                      <td className="p-6 text-sm">
                        <div className="font-medium">{res.event_date}</div>
                        <div className="text-gray-500">{res.event_time}h ({res.duration}h)</div>
                      </td>
                      <td className="p-6">
                        <span className={`text-[9px] font-black uppercase px-2 py-1 rounded ${
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
                            className="p-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20 transition-colors"
                          >
                            <CheckCircle size={16} />
                          </button>
                          <button 
                            onClick={() => updateStatus(res.id, 'rebutjat')}
                            className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
                          >
                            <XCircle size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <MessageSquare size={40} className="mx-auto mb-4 text-gray-600" />
              <h3 className="text-xl font-bold uppercase mb-2">Centre de Missatges</h3>
              <p className="text-gray-500 max-w-md mx-auto text-sm">
                Aviàt podràs respondre als teus clients directament des d'aquí. De moment, pots veure els xats actius a la base de dades.
              </p>
            </div>
          )}
        </div>
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
