"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const BTS_PHOTOS = [
  { src: "/Fotos/Carnaval 26/dj-posaxa-carnaval-2026-festa-0039.jpg", alt: "Carnaval 2026 Preparació" },
  { src: "/Fotos/dj-posaxa-disco-inferno-pnc-9.jpg", alt: "Disco Inferno PNC" },
  { src: "/Fotos/Carnaval 26/dj-posaxa-carnaval-2026-festa-0046.jpg", alt: "Carnaval 2026" },
  { src: "/Fotos/dj-posaxa-disco-inferno-pnc-12.jpg", alt: "Disco Inferno PNC 12" },
  { src: "/Fotos/Carnaval 26/dj-posaxa-carnaval-2026-festa-0086.jpg", alt: "Carnaval 2026" },
  { src: "/Fotos/dj-posaxa-disco-inferno-pnc-14.jpg", alt: "Disco Inferno PNC 14" },
];

export default function BehindTheScenes() {
  return (
    <section className="py-32 px-6 md:px-12 bg-black-deep">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h2 className="text-4xl md:text-6xl font-bold uppercase tracking-widest text-white-pure mb-4">
            DARRERE DE L&apos;ESPECTACLE
          </h2>
          <div className="w-24 h-1 bg-white-pure mx-auto"></div>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {BTS_PHOTOS.map((photo, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              className="relative h-64 md:h-80 overflow-hidden group cursor-pointer"
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black-deep/30 group-hover:bg-black-deep/0 transition-colors duration-500"></div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <a
            href="#"
            className="inline-block border-b border-gray-600 pb-1 text-sm font-bold uppercase tracking-widest hover:text-white-pure hover:border-white-pure transition-colors text-gray-400"
          >
            VEURE DARRERE LES CÀMERES
          </a>
        </div>
      </div>
    </section>
  );
}
