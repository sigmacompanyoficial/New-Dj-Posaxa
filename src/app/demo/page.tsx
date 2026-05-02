"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { TextPlugin } from "gsap/TextPlugin";

if (typeof window !== "undefined") {
  gsap.registerPlugin(TextPlugin);
}

export default function DemoPage() {
  const [iframeUrl, setIframeUrl] = useState("about:blank");
  const [isGoogle, setIsGoogle] = useState(true);
  const [searchText, setSearchText] = useState("");
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 3 });

      // 1. TYPING EN GOOGLE
      tl.to({}, {
        duration: 1.5,
        onUpdate: function() {
          const progress = this.progress();
          const text = "dj posaxa millor dj";
          setSearchText(text.substring(0, Math.ceil(progress * text.length)));
        }
      });

      // 2. CLICK GOOGLE RESULT
      tl.to(cursorRef.current, { x: 100, y: 240, opacity: 1, duration: 1, ease: "power2.inOut" });
      tl.to(cursorRef.current, { scale: 0.7, duration: 0.1 }).to(cursorRef.current, { scale: 1, duration: 0.1 });

      tl.call(() => {
        setIsGoogle(false);
        setIframeUrl("/");
      });

      // 3. OBRIR MENÚ MÒBIL (Hamburguesa a la part superior dreta)
      tl.to(cursorRef.current, { x: 380, y: 40, duration: 1.2, delay: 2 });
      tl.to(cursorRef.current, { scale: 0.7, duration: 0.1 }).to(cursorRef.current, { scale: 1, duration: 0.1 });
      
      // Simulem el clic al menú (obre la llista)
      tl.to(cursorRef.current, { y: 150, duration: 0.8, delay: 0.5 }); // Baixa cap a l'enllaç de Galeria del menú
      tl.to(cursorRef.current, { scale: 0.7, duration: 0.1 }).to(cursorRef.current, { scale: 1, duration: 0.1 });
      tl.call(() => setIframeUrl("/galeria"));

      // 4. SCROLL A GALERIA I SORTIDA
      tl.to(cursorRef.current, { y: 400, duration: 1.5, delay: 1 });
      
      // 5. ANAR A OPINIONS (Tornem a usar el menú)
      tl.to(cursorRef.current, { x: 380, y: 40, duration: 1, delay: 1 });
      tl.to(cursorRef.current, { scale: 0.7, duration: 0.1 }).to(cursorRef.current, { scale: 1, duration: 0.1 });
      tl.to(cursorRef.current, { y: 250, duration: 0.8, delay: 0.5 }); // Clic a "Opinions" o Home
      tl.to(cursorRef.current, { scale: 0.7, duration: 0.1 }).to(cursorRef.current, { scale: 1, duration: 0.1 });
      tl.call(() => setIframeUrl("/"));

      // 6. ESCRIURE OPINIÓ
      tl.to(cursorRef.current, { x: 200, y: 500, duration: 1.5, delay: 2 });
      tl.to(cursorRef.current, { scale: 0.7, duration: 0.1 }).to(cursorRef.current, { scale: 1, duration: 0.1 });

      // FINAL
      tl.to(cursorRef.current, { x: "110%", y: "-10%", opacity: 0, duration: 1.5, delay: 1 });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 overflow-hidden">
      <div ref={containerRef} className="relative w-full max-w-[420px] aspect-[9/19] bg-white overflow-hidden shadow-[0_0_120px_rgba(0,0,0,1)] rounded-[3rem]">
        
        {/* Punter Virtual */}
        <div 
          ref={cursorRef}
          className="absolute w-8 h-8 bg-white/30 border-2 border-white rounded-full z-[9999] pointer-events-none opacity-0 shadow-[0_0_20px_rgba(255,255,255,0.6)]"
          style={{ transform: "translate(-50%, -50%)" }}
        />

        {isGoogle ? (
          <div className="h-full w-full bg-white p-8 pt-20 flex flex-col">
            <div className="flex justify-center mb-10">
                <img src="https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png" width="90" alt="Google" />
            </div>
            <div className="w-full h-10 border border-gray-200 rounded-full flex items-center px-4 gap-2 shadow-sm mb-10">
              <span className="text-gray-800 text-[10px] font-medium truncate">{searchText}</span>
              <div className="w-[1.5px] h-3 bg-blue-500 animate-pulse"></div>
            </div>
            
            <div className="w-full space-y-6">
                <div className="space-y-1">
                    <p className="text-[9px] text-gray-500">https://djposaxa.com</p>
                    <h3 className="text-blue-700 text-sm font-medium leading-tight">DJ POSAXA | Professional DJ</h3>
                    <p className="text-[10px] text-gray-600 line-clamp-2">Reserva el millor DJ per a les teves festes i esdeveniments...</p>
                </div>
                <div className="space-y-1 opacity-60">
                    <p className="text-[9px] text-gray-500">https://instagram.com › dj.posaxa</p>
                    <h3 className="text-blue-700 text-sm font-medium leading-tight">DJ POSAXA (@dj.posaxa)</h3>
                </div>
            </div>
          </div>
        ) : (
          <iframe 
            ref={iframeRef}
            src={iframeUrl} 
            className="w-full h-full border-none pointer-events-none"
            title="Real Website"
          />
        )}
      </div>

      <div className="fixed bottom-8 text-white/10 text-[9px] uppercase tracking-[0.4em] font-black">
        Mobile Nav Demo · Ready
      </div>
    </div>
  );
}
