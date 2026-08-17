"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      // Check URL params for code and type
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const type = params.get("type"); // 'recovery' for password reset emails

      // Also check hash fragment (older Supabase flows use #access_token=...&type=recovery)
      const hash = window.location.hash;
      const hashParams = new URLSearchParams(hash.replace("#", "?"));
      const hashType = hashParams.get("type");

      const isRecovery = type === "recovery" || hashType === "recovery";

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          router.push("/auth/login?error=link-invalid");
          return;
        }
      }

      if (isRecovery) {
        // Password reset flow — go to reset page
        router.push("/auth/reset-password");
      } else {
        // Normal login / email verification — go to profile
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          router.push("/perfil");
        } else {
          router.push("/auth/login");
        }
      }
    };

    handleAuth();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}
