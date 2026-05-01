"use client";

import { useState, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

function VerifyContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const cleanToken = token.trim();
    const cleanEmail = email.trim().toLowerCase();

    // Using verifyOtp which supports 6-digit codes sent to email
    let { error } = await supabase.auth.verifyOtp({
      email: cleanEmail,
      token: cleanToken,
      type: "signup",
    });

    // If "signup" type fails, some Supabase versions prefer "email"
    if (error) {
      console.error("Error verifying with type 'signup':", error);
      const retry = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: cleanToken,
        type: "email",
      });
      error = retry.error;
    }

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/perfil");
    }
  };

  return (
    <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-md">
      <h2 className="text-3xl font-black uppercase text-center mb-4">Verifica el teu email</h2>
      <p className="text-gray-400 text-center text-sm mb-8">
        Hem enviat un codi de 6 dígits a <strong className="text-white">{email}</strong>. Introdueix-lo a continuació.
      </p>

      {error && <div className="bg-red-500/20 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg mb-6">{error}</div>}

      <form onSubmit={handleVerify} className="flex flex-col gap-5">
        <div>
          <label className="text-sm font-bold uppercase text-gray-400 mb-2 block">Codi de Verificació</label>
          <input 
            type="text" 
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white text-center text-2xl tracking-widest focus:outline-none focus:border-white/40 transition-colors"
            required
            maxLength={10}
            placeholder="000000"
          />
        </div>

        <button 
          type="submit" 
          disabled={loading || token.length < 6}
          className="w-full bg-white text-black font-bold uppercase tracking-widest py-4 rounded-xl mt-4 hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:hover:scale-100"
        >
          {loading ? "Verificant..." : "Verificar"}
        </button>
      </form>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full flex justify-center">
        <Suspense fallback={<div className="text-white">Carregant...</div>}>
          <VerifyContent />
        </Suspense>
      </motion.div>
    </div>
  );
}
