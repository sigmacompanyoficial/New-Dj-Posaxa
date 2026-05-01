"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Image as ImageIcon, Music, DollarSign, Home } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  const navItems = [
    { label: "Inici", href: "/", icon: <Home size={24} /> },
    { label: "Perfil", href: user ? "/perfil" : "/auth/login", icon: <User size={24} /> },
    { label: "Galeria", href: "/galeria", icon: <ImageIcon size={24} /> },
    { label: "Mashups", href: "/#mashups", icon: <Music size={24} /> },
    { label: "Preus", href: "/preus", icon: <DollarSign size={24} /> },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full z-50 bg-[#050505]/90 backdrop-blur-xl border-t border-white/10 pb-safe pt-2 px-4 flex justify-between items-center shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
      {navItems.map((item, idx) => {
        const isActive = pathname === item.href || (pathname === "/" && item.href.startsWith("/#"));
        
        return (
          <Link
            key={idx}
            href={item.href}
            className={`flex flex-col items-center justify-center w-full py-2 gap-1 transition-colors ${
              isActive ? "text-white" : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <div className={`${isActive ? "scale-110" : "scale-100"} transition-transform duration-300`}>
              {item.icon}
            </div>
            <span className="text-[10px] uppercase tracking-widest font-bold">
              {item.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
