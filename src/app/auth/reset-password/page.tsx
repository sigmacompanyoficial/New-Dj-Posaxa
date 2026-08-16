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
  const [checkingSession, setCheckingSession] = useState(true);
  const [sessionValid, setSessionValid] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      // 1. Check if there's a code in URL query params
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");

      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          setError("L'enllaç de recuperació ha caducat o no és vàlid.");
          setSessionValid(false);
        } else {
          setSessionValid(true);
        }
      } else {
        // 2. Check if there is an active session (e.g. from hash fragment or existing auth)
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setSessionValid(true);
        } else {
          // If no session found yet, wait for possible onAuthStateChange
          const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === "PASSWORD_RECOVERY" || session) {
              setSessionValid(true);
              setError(null);
            }
          });
          setTimeout(() => {
            setCheckingSession(false);
          }, 1500);
          return () => subscription.unsubscribe();
        }
      }
      setCheckingSession(false);
    };

    checkAuth();
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Les contrasenyes no coincideixen.");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("La contrasenya ha de tenir almenys 8 caràcters.");
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

        {checkingSession ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : !sessionValid ? (
          <div className="text-center space-y-4">
            <p className="text-sm text-gray-400">
              No s'ha detectat cap sessió de recuperació activa o l'enllaç ha caducat.
            </p>
            <button
              onClick={() => router.push("/auth/forgot-password")}
              className="w-full bg-white text-black font-bold uppercase tracking-widest py-3 rounded-xl hover:scale-[1.02] transition-transform"
            >
              Sol·licitar nou enllaç
            </button>
          </div>
        ) : (
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
        )}
      </motion.div>
    </div>
  );
}
