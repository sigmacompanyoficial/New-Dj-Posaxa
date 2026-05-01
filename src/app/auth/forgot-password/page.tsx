"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/auth/reset-password',
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage("Hem enviat un enllaç de recuperació al teu email.");
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
        <h2 className="text-3xl font-black uppercase text-center mb-4">Recuperar Contrasenya</h2>
        <p className="text-gray-500 text-center text-sm mb-8">Introdueix el teu email per rebre un enllaç de restabliment.</p>
        
        {error && <div className="bg-red-500/20 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg mb-6">{error}</div>}
        {message && <div className="bg-green-500/20 border border-green-500/50 text-green-500 text-sm p-3 rounded-lg mb-6">{message}</div>}

        <form onSubmit={handleResetRequest} className="flex flex-col gap-5">
          <div>
            <label className="text-sm font-bold uppercase text-gray-400 mb-2 block">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-white/40 transition-colors"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-white text-black font-bold uppercase tracking-widest py-4 rounded-xl mt-4 hover:scale-[1.02] transition-transform disabled:opacity-50"
          >
            {loading ? "Enviant..." : "Enviar Enllaç"}
          </button>
        </form>

        <p className="text-center text-gray-500 mt-6 text-sm">
          Has recordat la contrasenya? <Link href="/auth/login" className="text-white hover:underline">Torna al Login</Link>
        </p>
      </motion.div>
    </div>
  );
}
