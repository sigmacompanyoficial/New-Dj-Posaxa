"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { EVENTS } from "@/data/mock";

const fadeUp = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } }
};

export default function VisualGallery() {
  // Extract images from all events for the home gallery
  const galleryImages = EVENTS.flatMap(event => event.images).slice(0, 8);

  return (
    <section className="py-32 bg-[#050505] relative z-20">
      <div className="container mx-auto px-6 md:px-12 mb-16">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="flex flex-col items-center text-center"
        >
          <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter text-white-pure mb-6">
            MOMENTS INOBLIDABLES
          </h2>
          <p className="text-gray-400 text-lg md:text-xl font-light max-w-2xl">
            L'energia, el públic i la música en la seva màxima expressió.
          </p>
        </motion.div>
      </div>

      {/* Gallery wrapper */}
      <div className="w-full relative">
        <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 overflow-x-auto hide-scrollbar snap-x snap-mandatory px-6 md:px-12 lg:px-24 pb-8 w-full max-w-none">
          {galleryImages.map((src, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="snap-center shrink-0 w-[85vw] sm:w-[60vw] md:w-full relative overflow-hidden group cursor-pointer aspect-square sm:aspect-[4/5] rounded-[2rem] border border-white/10"
            >
              <Image
                src={src}
                alt={`Moment ${idx + 1}`}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                sizes="(max-width: 768px) 85vw, (max-width: 1200px) 50vw, 25vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black-deep/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="text-center mt-12">
        <a
          href="/esdeveniments"
          className="inline-block px-10 py-5 bg-white/5 backdrop-blur-md border border-white/10 text-white-pure font-bold uppercase tracking-widest rounded-full hover:bg-white-pure hover:text-black-deep transition-all duration-300"
        >
          VEURE GALERIA COMPLETA
        </a>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </section>
  );
}
