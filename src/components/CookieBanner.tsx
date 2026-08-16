"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookie-consent", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[999] p-4 md:p-6">
      <div className="max-w-6xl mx-auto bg-black-deep border border-white-pure/10 p-4 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 backdrop-blur-xl bg-opacity-90">
        <div className="flex-1">
          <p className="text-[9px] md:text-xs text-gray-400 uppercase tracking-widest leading-relaxed md:leading-loose text-center md:text-left">
            Aquest lloc web utilitza cookies. En continuar navegant, acceptes la nostra{" "}
            <Link href="/cookies" className="text-white-pure underline">cookies</Link>,{" "}
            <Link href="/privacitat" className="text-white-pure underline">privacitat</Link> i{" "}
            <Link href="/avis-legal" className="text-white-pure underline">avís legal</Link>.
          </p>
        </div>
        <div className="flex gap-2 md:gap-4 w-full md:w-auto">
          <button
            onClick={acceptCookies}
            className="flex-1 md:flex-none bg-white-pure text-black-deep px-4 md:px-8 py-2 md:py-3 text-[9px] md:text-[10px] font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors"
          >
            Acceptar
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="flex-1 md:flex-none border border-white-pure/20 text-white-pure px-4 md:px-8 py-2 md:py-3 text-[9px] md:text-[10px] font-bold uppercase tracking-widest hover:bg-white-pure/10 transition-colors"
          >
            Tancar
          </button>
        </div>
      </div>
    </div>
  );
}
