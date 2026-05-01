"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

// Data
const CARNAVAL_VIDEOS = [
  "VID-20260214-WA0099.mp4", "VID-20260214-WA0098.mp4", "VID-20260214-WA0097.mp4",
  "VID-20260214-WA0096.mp4", "VID-20260214-WA0095.mp4", "VID-20260214-WA0094.mp4", "VID-20260214-WA0104.mp4"
];

const CARNAVAL_PHOTOS = [
  "0058", "0001", "0037", "0039", "0041", "0043", "0044", "0046", "0048", "0050", 
  "0052", "0054", "0056", "0060", "0062", "0064", "0066", "0068", "0070", "0072", 
  "0074", "0076", "0078", "0080", "0082", "0084", "0086"
];

const DISCO_INFERNO_PHOTOS = Array.from({ length: 19 }, (_, i) => i);

const GRA_JOVE_VIDEOS = [
  "IMG_2443.mov", "IMG_2445.mov", "IMG_2449.mov", "IMG_2450.mov"
];

const POSTERS = [
  "dj-posaxa-poster.jpg", "dj-posaxa-montserrat-2026.png", "sessions-can-torrents.png"
];

export default function GaleriaPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [allImages, setAllImages] = useState<string[]>([]);

  const openLightbox = (src: string, currentContext: string[]) => {
    setAllImages(currentContext);
    setSelectedImage(src);
  };

  const closeLightbox = () => setSelectedImage(null);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedImage) return;
    const currentIndex = allImages.indexOf(selectedImage);
    const nextIndex = (currentIndex + 1) % allImages.length;
    setSelectedImage(allImages[nextIndex]);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedImage) return;
    const currentIndex = allImages.indexOf(selectedImage);
    const prevIndex = (currentIndex - 1 + allImages.length) % allImages.length;
    setSelectedImage(allImages[prevIndex]);
  };

  return (
    <div className="bg-[#050505] text-white min-h-screen selection:bg-white selection:text-black">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/70 to-[#050505] z-10" />
          <img 
            src="/Fotos/eventos/disco-inferno-xs-2025/dj-posaxa-disco-inferno-pnc-1.jpg" 
            className="w-full h-full object-cover opacity-50"
            alt="Galeria"
          />
        </div>
        <div className="relative z-10 text-center px-6 mt-20">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-[6rem] lg:text-[8rem] font-black uppercase tracking-tighter leading-none mb-4"
          >
            GALERIA
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-gray-400 text-lg md:text-2xl uppercase tracking-widest font-bold"
          >
            Els records de les millors sessions
          </motion.p>
        </div>
      </section>

      {/* Navigation Links inside Gallery */}
      <div className="sticky top-[70px] z-30 bg-[#050505]/90 backdrop-blur-md border-b border-white/10 py-4 px-6 overflow-x-auto hide-scrollbar">
        <div className="container mx-auto flex gap-6 md:justify-center whitespace-nowrap">
          <a href="#carnaval" className="text-gray-400 hover:text-white uppercase text-sm font-bold tracking-widest transition-colors">Carnaval 26</a>
          <a href="#disco" className="text-gray-400 hover:text-white uppercase text-sm font-bold tracking-widest transition-colors">Disco Inferno</a>
          <a href="#gra" className="text-gray-400 hover:text-white uppercase text-sm font-bold tracking-widest transition-colors">Gra Jove</a>
          <a href="#posters" className="text-gray-400 hover:text-white uppercase text-sm font-bold tracking-widest transition-colors">Posters</a>
        </div>
      </div>

      <div className="container mx-auto px-6 py-20 flex flex-col gap-32">
        
        {/* CARNAVAL 26 */}
        <section id="carnaval" className="scroll-mt-[150px]">
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-12 pl-6 border-l-4 border-white">Carnaval 2026 (NAUB1)</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {CARNAVAL_VIDEOS.map((vid, idx) => (
              <video 
                key={idx} 
                src={`/Fotos/eventos/carnaval-2026/${vid}`} 
                controls 
                className="w-full aspect-[4/3] bg-black/50 rounded-[2rem] border border-white/10"
              />
            ))}
          </div>

          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {CARNAVAL_PHOTOS.map((num) => {
              const src = `/Fotos/eventos/carnaval-2026/dj-posaxa-carnaval-2026-festa-${num}.jpg`;
              const fullList = CARNAVAL_PHOTOS.map(n => `/Fotos/eventos/carnaval-2026/dj-posaxa-carnaval-2026-festa-${n}.jpg`);
              return (
                <div 
                  key={num} 
                  className="relative overflow-hidden rounded-[1.5rem] break-inside-avoid cursor-pointer group"
                  onClick={() => openLightbox(src, fullList)}
                >
                  <img src={src} alt="Carnaval 2026" className="w-full h-auto transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />
                </div>
              );
            })}
          </div>
        </section>

        {/* DISCO INFERNO */}
        <section id="disco" className="scroll-mt-[150px]">
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-12 pl-6 border-l-4 border-white">Festa Major: Disco Inferno XS</h2>
          
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {DISCO_INFERNO_PHOTOS.map((num) => {
              const src = `/Fotos/eventos/disco-inferno-xs-2025/dj-posaxa-disco-inferno-pnc-${num}.jpg`;
              const fullList = DISCO_INFERNO_PHOTOS.map(n => `/Fotos/eventos/disco-inferno-xs-2025/dj-posaxa-disco-inferno-pnc-${n}.jpg`);
              return (
                <div 
                  key={num} 
                  className="relative overflow-hidden rounded-[1.5rem] break-inside-avoid cursor-pointer group"
                  onClick={() => openLightbox(src, fullList)}
                >
                  <img src={src} alt="Disco Inferno" className="w-full h-auto transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />
                </div>
              );
            })}
          </div>
        </section>

        {/* GRA JOVE */}
        <section id="gra" className="scroll-mt-[150px]">
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-12 pl-6 border-l-4 border-white">Gra Jove (MusiKnviu)</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {GRA_JOVE_VIDEOS.map((vid, idx) => (
              <video 
                key={idx} 
                src={`/Fotos/eventos/gra-jove-musiknviu-2025/${vid}`} 
                controls 
                className="w-full aspect-[16/9] md:aspect-auto h-[60vh] object-cover bg-black/50 rounded-[2rem] border border-white/10"
              />
            ))}
          </div>
        </section>

        {/* POSTERS */}
        <section id="posters" className="scroll-mt-[150px]">
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-12 pl-6 border-l-4 border-white">Pòsters</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {POSTERS.map((poster, idx) => {
              const src = `/Fotos/posters/${poster}`;
              const fullList = POSTERS.map(p => `/Fotos/posters/${p}`);
              return (
                <div 
                  key={idx} 
                  className="relative overflow-hidden rounded-[2rem] aspect-[4/5] cursor-pointer group border border-white/10 bg-white/5"
                  onClick={() => openLightbox(src, fullList)}
                >
                  <div className="absolute top-4 left-4 z-10 bg-white text-black text-xs font-black uppercase px-4 py-1 rounded-full shadow-xl">
                    Pòster
                  </div>
                  <img src={src} alt="Poster" className="w-full h-full object-contain p-8 transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                </div>
              );
            })}
          </div>
        </section>

      </div>

      {/* LIGHTBOX */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center"
            onClick={closeLightbox}
          >
            <button onClick={closeLightbox} className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors z-[101]">
              <X size={40} />
            </button>
            
            <button onClick={prevImage} className="absolute left-4 md:left-12 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition-colors z-[101]">
              <ChevronLeft size={30} />
            </button>

            <motion.img 
              key={selectedImage}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 20 }}
              src={selectedImage} 
              className="max-w-[90vw] max-h-[85vh] object-contain rounded-xl shadow-[0_0_50px_rgba(255,255,255,0.1)]" 
              onClick={(e) => e.stopPropagation()}
            />

            <button onClick={nextImage} className="absolute right-4 md:right-12 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition-colors z-[101]">
              <ChevronRight size={30} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}
