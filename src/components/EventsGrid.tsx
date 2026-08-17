"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { EVENTS } from "@/data/mock";

const fadeUp = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } }
};

export default function EventsGrid() {
  return (
    <section id="events" className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 md:px-12 bg-black-deep relative z-20">
      <div className="container mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="mb-12 sm:mb-20 flex flex-col items-center text-center"
        >
          <h2 className="text-3xl sm:text-5xl md:text-7xl font-black uppercase tracking-tighter text-white-pure mb-3 sm:mb-6">
            ESDEVENIMENTS
          </h2>
          <p className="text-gray-400 text-sm sm:text-lg md:text-xl max-w-2xl font-light">
            De les primeres festes a Granollers als grans escenaris. Descobreix l'energia i els millors moments de cada sessió.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {EVENTS.map((event, index) => (
            <motion.div
              key={event.id}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              variants={fadeUp}
              className="group cursor-pointer bg-white/[0.02] border border-white/10 rounded-[2rem] p-6 hover:bg-white/[0.04] transition-colors flex flex-col"
            >
              <div className="relative aspect-[16/9] mb-6 overflow-hidden rounded-[1.5rem] border border-white/5">
                <Image
                   src={event.image}
                   alt={event.title}
                   fill
                   className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />
              </div>
              <div className="flex flex-col gap-2 flex-1">
                <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white-pure">
                  {event.title}
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed mb-4 flex-1">
                  {event.description}
                </p>
                <div className="mt-auto">
                  <span className="text-[#667eea] text-sm font-bold uppercase tracking-widest group-hover:text-white transition-colors">
                    Veure detalls →
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="mt-20 text-center"
        >
          <Link
            href="/esdeveniments"
            className="inline-block px-10 py-5 bg-white/5 backdrop-blur-md border border-white/10 text-white-pure font-bold uppercase tracking-widest rounded-full hover:bg-white-pure hover:text-black-deep transition-all duration-300"
          >
            L'HISTORIAL COMPLET
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
