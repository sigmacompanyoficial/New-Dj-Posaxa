"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";

const SLIDES = [
  { src: "/Fotos/dj-posaxa-sessio-inici-1.jpg", title: "L'INICI", sub: "L'energia de la nit comença aquí." },
  { src: "/Fotos/dj-posaxa-sessio-inici-2.jpg", title: "CONNEXIÓ", sub: "Sentint el ritme amb el públic." },
  { src: "/Fotos/dj-posaxa-sessio-inici-3.jpg", title: "VIBRACIÓ", sub: "Música que mou l'ànima." },
  { src: "/Fotos/dj-posaxa-sessio-inici-4.jpg", title: "EL SHOW", sub: "Espectacle visual i sonor total." },
  { src: "/Fotos/dj-posaxa-actuacio-en-viu.jpg", title: "EN VIU", sub: "La millor selecció de mashups." },
  { src: "/Fotos/dj-posaxa-actuacio-moment-1.jpg", title: "EUPHÒRIA", sub: "Moments que queden gravats." },
  { src: "/Fotos/dj-posaxa-actuacio-moment-2.jpg", title: "FESTA", sub: "Celebració sense límits." },
  { src: "/Fotos/dj-posaxa-biografia.jpeg", title: "POSAXA", sub: "Pol Solanas Ramos — DJ Professional." },
];

export default function PhotoScroll() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Calculate horizontal movement
  const x = useTransform(scrollYProgress, [0, 1], ["0%", `-${(SLIDES.length - 1) * 100}%`]);

  return (
    <section ref={containerRef} className="relative h-[800vh] bg-black-deep">
      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
        <motion.div style={{ x }} className="flex h-full w-fit">
          {SLIDES.map((slide, index) => (
            <div 
              key={index} 
              className="relative w-screen h-screen flex-shrink-0 p-4 md:p-12"
            >
              <div className="relative w-full h-full overflow-hidden rounded-[2rem] md:rounded-[4rem] border border-white/10 group">
                <Image
                  src={slide.src}
                  alt={slide.title}
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-105"
                  priority={index < 2}
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black-deep/80 via-transparent to-transparent" />
                
                <div className="absolute bottom-12 left-12 md:bottom-24 md:left-24">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.5 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  >
                    <span className="text-white/40 text-xs uppercase tracking-[0.4em] mb-4 block">0{index + 1} — {slide.sub}</span>
                    <h2 className="text-5xl md:text-8xl lg:text-[10rem] font-black text-white-pure uppercase tracking-tighter leading-none">
                      {slide.title}
                    </h2>
                  </motion.div>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
