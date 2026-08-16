"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const validatePassword = (pass: string) => {
    const hasUpperCase = /[A-Z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);
    const isLongEnough = pass.length >= 8;
    return hasUpperCase && hasNumber && isLongEnough;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Les contrasenyes no coincideixen.");
      setLoading(false);
      return;
    }

    if (!validatePassword(password)) {
      setError("La contrasenya ha de tenir almenys 8 caràcters, incloure una lletra majúscula i un número.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        }
      }
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push(`/auth/verify?email=${encodeURIComponent(email)}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-6 py-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-md"
      >
        <h2 className="text-3xl font-black uppercase text-center mb-8">Crear Compte</h2>
        
        {error && <div className="bg-red-500/20 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg mb-6">{error}</div>}

        <form onSubmit={handleRegister} className="flex flex-col gap-5">
          <div>
            <label className="text-sm font-bold uppercase text-gray-400 mb-2 block">Nom Complet</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-white/40 transition-colors"
              required
            />
          </div>

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
          
          <div>
            <label className="text-sm font-bold uppercase text-gray-400 mb-2 block">Contrasenya</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-white/40 transition-colors"
              required
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
            className="w-full bg-white text-black font-bold uppercase tracking-widest py-4 rounded-xl mt-4 hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading ? "Creant compte..." : "Registrar-se"}
          </button>
        </form>

        <p className="text-center text-gray-500 mt-6 text-sm">
          Ja tens compte? <Link href="/auth/login" className="text-white hover:underline">Inicia sessió</Link>
        </p>
      </motion.div>
    </div>
  );
}
