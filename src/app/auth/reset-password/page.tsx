"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Les contrasenyes no coincideixen.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      setError(error.message);
    } else {
      router.push("/perfil?message=Contrasenya actualitzada");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-md"
      >
        <h2 className="text-3xl font-black uppercase text-center mb-4">Nova Contrasenya</h2>
        <p className="text-gray-500 text-center text-sm mb-8">Escriu la teva nova contrasenya de seguretat.</p>
        
        {error && <div className="bg-red-500/20 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg mb-6">{error}</div>}

        <form onSubmit={handleUpdatePassword} className="flex flex-col gap-5">
          <div>
            <label className="text-sm font-bold uppercase text-gray-400 mb-2 block">Nova Contrasenya</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-white/40 transition-colors"
              required
              minLength={8}
            />
          </div>
          
          <div>
            <label className="text-sm font-bold uppercase text-gray-400 mb-2 block">Confirmar Contrasenya</label>
            <input 
              type="password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-white/40 transition-colors"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-white text-black font-bold uppercase tracking-widest py-4 rounded-xl mt-4 hover:scale-[1.02] transition-transform disabled:opacity-50"
          >
            {loading ? "Actualitzant..." : "Canviar Contrasenya"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
