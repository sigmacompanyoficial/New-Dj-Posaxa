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

const LA_GARRIGA_PHOTOS = [
  "0ceeb844-a69d-4e14-b5b4-cac5eae91d65", "6861b1eb-9cb7-49b3-ba22-8f04e78fcde5", "fd365fd7-b7a9-40d8-8fc5-3479a48611ff",
  "03d8e638-f8e1-4faf-8ab7-2b7b59296ea6", "04216c90-2dca-4108-92cb-8dac967d79a4", "5c3a732c-6c63-47f7-8d54-d7c7ff79e7af",
  "f0658cfd-6040-401e-bcdd-3d3be0e17d04", "30bd7efc-b56e-4f8d-a265-d0f7476c273a", "02b8db73-e60c-409e-abeb-7307a8b72827",
  "03b43304-4fb6-4fce-8202-3bbe3bec02f9", "0c097135-46e1-45a1-9182-50a67aa24d79", "101970c9-47e7-469e-b8cb-eb2133ab92bc"
];

const POSTERS = [
  "dj-posaxa-poster.jpg", "dj-posaxa-montserrat-2026.png", "sessions-can-torrents.png"
];

export default function GaleriaPage() {
  const [activeEvent, setActiveEvent] = useState<string>("garriga");
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

  const EVENTS_LIST = [
    { id: "garriga", title: "La Garriga 26", cover: `/Fotos/eventos/La garriga 2026/${LA_GARRIGA_PHOTOS[0]}.jpeg` },
    { id: "carnaval", title: "Carnaval 26", cover: `/Fotos/eventos/carnaval-2026/dj-posaxa-carnaval-2026-festa-0050.jpg` },
    { id: "disco", title: "Disco Inferno", cover: `/Fotos/eventos/disco-inferno-xs-2025/dj-posaxa-disco-inferno-pnc-1.jpg` },
    { id: "gra", title: "Gra Jove", cover: `/Fotos/eventos/disco-inferno-xs-2025/dj-posaxa-disco-inferno-pnc-16.jpg` },
    { id: "posters", title: "Pòsters", cover: `/Fotos/posters/dj-posaxa-poster.jpg` },
  ];

  return (
    <div className="bg-[#050505] text-white min-h-screen selection:bg-white selection:text-black">
      {/* Hero Section */}
      <section className="relative h-[40vh] md:h-[50vh] flex items-center justify-center overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/70 to-[#050505] z-10" />
          <img 
            src="/Fotos/eventos/La garriga 2026/6861b1eb-9cb7-49b3-ba22-8f04e78fcde5.jpeg" 
            className="w-full h-full object-cover opacity-30"
            alt="Galeria"
          />
        </div>
        <div className="relative z-10 text-center px-6 mt-10">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-none mb-4"
          >
            GALERIA
          </motion.h1>
          <p className="text-gray-500 text-sm md:text-xl uppercase tracking-widest font-bold">
            Selecciona un esdeveniment per veure els records
          </p>
        </div>
      </section>

      {/* Event Selector */}
      <div className="bg-[#050505] border-b border-white/10 py-6 overflow-x-auto hide-scrollbar">
        <div className="container mx-auto flex gap-4 px-6 md:justify-center">
          {EVENTS_LIST.map((event) => (
            <button
              key={event.id}
              onClick={() => setActiveEvent(event.id)}
              className={`group relative shrink-0 w-32 md:w-48 aspect-video rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                activeEvent === event.id ? "border-white scale-105 shadow-lg shadow-white/10" : "border-white/10 opacity-50 hover:opacity-80"
              }`}
            >
              <img src={event.cover} className="w-full h-full object-cover" alt={event.title} />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="text-[10px] md:text-xs font-black uppercase tracking-tighter text-center px-2">
                  {event.title}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 md:py-20 min-h-[60vh]">
        <AnimatePresence mode="wait">
          {activeEvent === "garriga" && (
            <motion.section 
              key="garriga"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight pl-6 border-l-4 border-white text-blue-300">La Garriga 2026</h2>
              <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                {LA_GARRIGA_PHOTOS.map((num) => {
                  const src = `/Fotos/eventos/La garriga 2026/${num}.jpeg`;
                  return (
                    <div key={num} onClick={() => openLightbox(src, LA_GARRIGA_PHOTOS.map(n => `/Fotos/eventos/La garriga 2026/${n}.jpeg`))} className="relative overflow-hidden rounded-[1.5rem] break-inside-avoid cursor-pointer group border border-white/5">
                      <img src={src} className="w-full h-auto transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                    </div>
                  );
                })}
              </div>
            </motion.section>
          )}

          {activeEvent === "carnaval" && (
            <motion.section 
              key="carnaval"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight pl-6 border-l-4 border-white">Carnaval 2026 (NAUB1)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {CARNAVAL_VIDEOS.map((vid, idx) => (
                  <video key={idx} src={`/Fotos/eventos/carnaval-2026/${vid}`} controls className="w-full aspect-[4/3] bg-black/50 rounded-[2rem] border border-white/10" />
                ))}
              </div>
              <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                {CARNAVAL_PHOTOS.map((num) => {
                  const src = `/Fotos/eventos/carnaval-2026/dj-posaxa-carnaval-2026-festa-${num}.jpg`;
                  return (
                    <div key={num} onClick={() => openLightbox(src, CARNAVAL_PHOTOS.map(n => `/Fotos/eventos/carnaval-2026/dj-posaxa-carnaval-2026-festa-${n}.jpg`))} className="relative overflow-hidden rounded-[1.5rem] break-inside-avoid cursor-pointer group">
                      <img src={src} className="w-full h-auto transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                    </div>
                  );
                })}
              </div>
            </motion.section>
          )}

          {activeEvent === "disco" && (
            <motion.section 
              key="disco"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight pl-6 border-l-4 border-white">Disco Inferno XS</h2>
              <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                {DISCO_INFERNO_PHOTOS.map((num) => {
                  const src = `/Fotos/eventos/disco-inferno-xs-2025/dj-posaxa-disco-inferno-pnc-${num}.jpg`;
                  return (
                    <div key={num} onClick={() => openLightbox(src, DISCO_INFERNO_PHOTOS.map(n => `/Fotos/eventos/disco-inferno-xs-2025/dj-posaxa-disco-inferno-pnc-${n}.jpg`))} className="relative overflow-hidden rounded-[1.5rem] break-inside-avoid cursor-pointer group">
                      <img src={src} className="w-full h-auto transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                    </div>
                  );
                })}
              </div>
            </motion.section>
          )}

          {activeEvent === "gra" && (
            <motion.section 
              key="gra"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight pl-6 border-l-4 border-white">Gra Jove (MusiKnviu)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {GRA_JOVE_VIDEOS.map((vid, idx) => (
                  <video key={idx} src={`/Fotos/eventos/gra-jove-musiknviu-2025/${vid}`} controls className="w-full aspect-[16/9] md:aspect-auto h-[60vh] object-cover bg-black/50 rounded-[2rem] border border-white/10" />
                ))}
              </div>
            </motion.section>
          )}

          {activeEvent === "posters" && (
            <motion.section 
              key="posters"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight pl-6 border-l-4 border-white">Pòsters</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {POSTERS.map((poster, idx) => {
                  const src = `/Fotos/posters/${poster}`;
                  return (
                    <div key={idx} onClick={() => openLightbox(src, POSTERS.map(p => `/Fotos/posters/${p}`))} className="relative overflow-hidden rounded-[2rem] aspect-[4/5] cursor-pointer group border border-white/10 bg-white/5">
                      <img src={src} className="w-full h-full object-contain p-8 transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                    </div>
                  );
                })}
              </div>
            </motion.section>
          )}
        </AnimatePresence>
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
