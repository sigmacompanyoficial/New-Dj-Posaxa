"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

// Target: 26 d'agost 2026 · 22:00h (hora local)
const TARGET = new Date("2026-08-26T22:00:00");

function getTimeLeft() {
  const diff = TARGET.getTime() - Date.now();
  if (diff <= 0) return null;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return { days, hours, minutes, seconds };
}

const Unit = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-col items-center gap-1 md:gap-2">
    <motion.span
      key={value}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="text-5xl md:text-7xl lg:text-8xl font-black tabular-nums leading-none tracking-tighter text-white"
    >
      {String(value).padStart(2, "0")}
    </motion.span>
    <span className="text-[9px] md:text-[11px] uppercase tracking-[0.25em] text-gray-500 font-semibold">
      {label}
    </span>
  </div>
);

export default function NextShowCountdown() {
  const [time, setTime] = useState(getTimeLeft());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => setTime(getTimeLeft()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  // Mostra el botó quan queda menys d'1 dia (24h) per al show
  const showButton = time !== null && time.days < 1;

  return (
    <section className="relative py-24 px-6 md:px-12 bg-[#050505] overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/[0.04] rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="flex flex-col items-center text-center"
        >
          {/* Label */}
          <div className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-40" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
            </span>
            <span className="text-[10px] uppercase tracking-[0.25em] text-gray-400 font-semibold">
              Proper show
            </span>
          </div>

          {/* Event title */}
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-2 text-white leading-none">
            Blancs to Hell
          </h2>
          <p className="text-base md:text-lg text-gray-500 font-light tracking-wide mb-2">
            DJ Posaxa · Disco Inferno
          </p>
          <p className="text-sm text-gray-600 uppercase tracking-widest mb-12">
            Plaça Pau Casals · 26 d'agost · 22:00–00:00h
          </p>

          {/* Countdown */}
          {time ? (
            <div className="flex items-end gap-6 md:gap-10 lg:gap-14">
              <Unit value={time.days} label="Dies" />
              <span className="text-4xl md:text-6xl font-thin text-white/20 pb-5 md:pb-7 leading-none select-none">:</span>
              <Unit value={time.hours} label="Hores" />
              <span className="text-4xl md:text-6xl font-thin text-white/20 pb-5 md:pb-7 leading-none select-none">:</span>
              <Unit value={time.minutes} label="Minuts" />
              <span className="text-4xl md:text-6xl font-thin text-white/20 pb-5 md:pb-7 leading-none select-none">:</span>
              <Unit value={time.seconds} label="Segons" />
            </div>
          ) : (
            <p className="text-2xl font-bold text-white uppercase tracking-widest">
              Ja ha passat — fins aviat!
            </p>
          )}

          {/* Botó "Demana una cançó" — apareix 24h abans del show */}
          {showButton && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="mt-10"
            >
              <a
                href="/peticiones-canciones"
                className="group inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-bold text-sm uppercase tracking-widest rounded-full hover:scale-105 active:scale-95 transition-transform duration-300 shadow-[0_0_40px_rgba(255,255,255,0.15)]"
              >
                <span>🎵</span>
                Demana una cançó
                <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
              </a>
              <p className="text-xs text-gray-600 mt-3 uppercase tracking-widest">
                El show és avui — envia la teva petició ara!
              </p>
            </motion.div>
          )}

          {/* Divider */}
          <div className="w-full max-w-xs h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent mt-12" />
        </motion.div>
      </div>
    </section>
  );
}
