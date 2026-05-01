"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} id="hero" className="relative min-h-[100dvh] w-full flex items-center justify-center overflow-hidden bg-black-deep">
      {/* Parallax background */}
      <motion.div className="absolute inset-0 z-0" style={{ y, opacity }}>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black-deep/60 to-black-deep z-10" />
        <Image
          src="/Fotos/dj-posaxa-sessio-inici-1.jpg"
          alt="DJ Posaxa Live"
          fill
          priority
          className="object-cover object-center opacity-40 scale-105"
        />
      </motion.div>

      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 mt-20 w-full max-w-[100vw]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="w-full"
        >
          <h1 className="text-5xl sm:text-6xl md:text-[8rem] lg:text-[10rem] font-black uppercase tracking-tighter leading-none mb-6 mix-blend-difference text-white-pure w-full break-words">
            DJ POSAXA
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="text-lg md:text-2xl text-gray-400 max-w-2xl mx-auto font-light tracking-wide mb-12 px-2"
        >
          Experiències musicals inoblidables. Connexió pura amb el públic.
        </motion.p>

        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <motion.a
            href="/preus"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="px-8 py-4 md:px-10 md:py-5 bg-white-pure text-black-deep font-bold uppercase tracking-widest rounded-full hover:scale-105 transition-transform duration-300 shadow-[0_0_40px_rgba(255,255,255,0.3)]"
          >
            Reserva Ara
          </motion.a>
          
          <motion.a
            href="/perfil?tab=chat"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="px-8 py-4 md:px-10 md:py-5 bg-white-pure/10 backdrop-blur-md border border-white-pure/20 text-white-pure font-bold uppercase tracking-widest rounded-full hover:bg-white-pure/20 transition-all duration-300"
          >
            Contacte Directe
          </motion.a>
        </div>
      </div>

      {/* Animated scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
      >
        <span className="text-[10px] uppercase tracking-[0.3em] text-gray-500">Scroll</span>
        <div className="w-[1px] h-12 bg-white-pure/20 relative overflow-hidden">
          <motion.div
            animate={{ y: ["-100%", "200%"] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            className="w-full h-1/2 bg-white-pure absolute top-0 left-0"
          />
        </div>
      </motion.div>
    </section>
  );
}
