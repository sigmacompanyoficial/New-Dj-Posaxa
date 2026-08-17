"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const fadeUp = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } }
};

export default function EditorialSection() {
  return (
    <section id="focus" className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 md:px-12 bg-black-deep text-white-pure overflow-hidden relative z-20">
      <div className="container mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="flex flex-col lg:flex-row gap-12 lg:gap-24"
        >
          {/* Text column */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center order-2 lg:order-1">
            <h2 className="text-xs sm:text-sm tracking-widest uppercase text-gray-500 mb-4 sm:mb-6 bg-white/5 inline-block w-fit px-3.5 py-1 rounded-full border border-white/10">
              Sobre Mi
            </h2>
            <h3 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter mb-6 sm:mb-8 leading-[0.9] bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500">
              EN QUÈ<br />EM CENTRO
            </h3>

            <p className="text-sm sm:text-base md:text-xl text-gray-400 mb-6 sm:mb-8 max-w-lg leading-relaxed font-light">
              DJ Posaxa és el nom artístic de Pol Solanas Ramos, nascut el 16 de juny de 2010 a Granollers. Apassionat per la música des de ben petit.
              <br /><br />
              El meu estil combina reggaeton, dembow, techno i música festiva, prioritzant l'energia i la connexió total amb el públic.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-8 sm:mb-10">
              {[
                { icon: "💿", title: "Expert en Mashups", desc: "Creacions úniques i mescles en directe." },
                { icon: "🎵", title: "Música per a Tots", desc: "Un repertori versàtil que s'adapta." },
                { icon: "⭐", title: "Animació Pro", desc: "Atmosfera vibrant i energia." },
                { icon: "🔥", title: "Professionalitat", desc: "Compromís total amb cada esdeveniment." },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white/[0.02] border border-white/10 rounded-2xl sm:rounded-[1.5rem] p-4 sm:p-6 hover:bg-white/[0.04] transition-colors"
                >
                  <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">{item.icon}</div>
                  <h4 className="font-bold tracking-tight uppercase text-base sm:text-lg mb-1 sm:mb-2">{item.title}</h4>
                  <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>

            <p className="text-sm sm:text-base italic text-gray-500 max-w-lg leading-relaxed border-l-2 border-gray-700 pl-4 sm:pl-6 mt-2 sm:mt-4">
              "La música té un impacte directe en les emocions. Em centro en crear experiències que connectin amb el públic, llegint la pista i adaptant l'energia de la sala a cada moment."
            </p>
          </div>

          {/* Image column */}
          <div className="w-full lg:w-1/2 order-1 lg:order-2 flex items-center justify-center relative">
            <motion.div
              className="relative aspect-[4/5] w-full max-w-lg mx-auto overflow-hidden rounded-[2rem] border border-white/10 group"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
              <Image
                src="/Fotos/dj-posaxa-biografia.jpeg"
                alt="DJ Posaxa Biografia"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black-deep via-transparent to-transparent opacity-80" />
            </motion.div>
            
            {/* Glowing Accent */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[#667eea]/5 blur-[120px] rounded-full pointer-events-none -z-10" />
          </div>

        </motion.div>
      </div>
    </section>
  );
}
