"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function VibeSection() {
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
          <h2 className="text-3xl md:text-6xl font-bold uppercase tracking-widest text-white-pure mb-4">
            EL QUE EM DEFINEIX
          </h2>
          <div className="w-24 h-1 bg-white-pure mx-auto"></div>
        </motion.div>

        <div className="flex flex-col md:flex-row items-center gap-16 md:gap-24">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full md:w-1/2 space-y-10"
          >
            {[
              { emoji: "🎧", title: "Versatilitat", desc: "De reggaeton a techno, de hits comercials a remember. M'adapto al tipus de públic i esdeveniment." },
              { emoji: "⚡", title: "Energia", desc: "No només poso música. Animo, interactuo i faig que la pista estigui plena durant tota la nit." },
              { emoji: "🔥", title: "Professionalitat", desc: "Equipament de qualitat, puntualitat i compromís total amb cada esdeveniment." },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className="border-l-2 border-white-pure/20 pl-6 hover:border-white-pure transition-colors duration-300"
              >
                <h3 className="text-2xl font-bold text-white-pure mb-2">
                  {item.emoji} {item.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full md:w-1/2"
          >
            <div className="relative aspect-[3/4] w-full overflow-hidden shadow-2xl">
              <Image
                src="/Fotos/dj-posaxa-sessio-inici-4.jpg"
                alt="DJ Posaxa Sessió"
                fill
                className="object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
