"use client";

import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } }
};

export default function PreusPage() {
  return (
    <div className="bg-[#050505] text-white min-h-screen selection:bg-white selection:text-black">
      {/* 
        =================
        HERO SECTION
        =================
      */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/60 to-[#050505] z-10" />
          <img 
            src="/Fotos/dj-posaxa-sessio-inici-3.jpg" 
            className="w-full h-full object-cover opacity-30"
            alt="Preus i Reserves"
          />
        </div>

        <div className="relative z-10 text-center px-6 mt-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="text-5xl md:text-[6rem] lg:text-[8rem] font-black uppercase tracking-tighter leading-none mb-6 text-white-pure">
              RESERVES
            </h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto font-light tracking-wide"
          >
            Sol·licita un pressupost a mida per al teu esdeveniment.
          </motion.p>
        </div>
      </section>

      {/* 
        =================
        INFO & FORM SECTION
        =================
      */}
      <section className="py-24 px-6 md:px-12 relative z-20">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            
            {/* Info Column */}
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="lg:col-span-5 flex flex-col gap-12"
            >
              <div>
                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500">
                  Política de Preus
                </h2>
                <p className="text-lg text-gray-400 leading-relaxed font-light mb-6">
                  Cada esdeveniment és únic. <strong className="text-white">No treballo amb preus fixos</strong> perquè les necessitats (durada, equip tècnic, distància) varien substancialment.
                </p>
                <p className="text-lg text-gray-400 leading-relaxed font-light mb-6">
                  El meu compromís és oferir un espectacle professional i personalitzat. Per això, preparo un pressupost a mida per a cada ocasió.
                </p>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mt-8">
                  <p className="text-sm text-gray-300 italic">
                    * Només demano que l'escenari estigui muntat i els altaveus disponibles si no es contracta equip extra.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold uppercase tracking-widest text-gray-500 mb-4">Contacte Directe</h3>
                <a href="mailto:newposaxa@gmail.com" className="inline-block text-2xl md:text-3xl font-bold text-white hover:text-gray-300 transition-colors">
                  newposaxa@gmail.com
                </a>
              </div>
            </motion.div>

            {/* Form Column */}
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="lg:col-span-7"
            >
              <div className="bg-white/[0.02] border border-white/10 rounded-[2rem] p-8 md:p-12 backdrop-blur-sm">
                <h2 className="text-2xl font-black uppercase tracking-tight mb-8">Sol·licitar Pressupost</h2>
                
                <form className="flex flex-col gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Nom i Cognoms / Entitat</label>
                      <input type="text" placeholder="La teva entitat o nom" className="bg-transparent border-b border-white/20 pb-2 text-white focus:outline-none focus:border-white transition-colors" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Telèfon</label>
                      <input type="tel" placeholder="+34 000 000 000" className="bg-transparent border-b border-white/20 pb-2 text-white focus:outline-none focus:border-white transition-colors" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Email</label>
                    <input type="email" placeholder="exemple@correu.com" className="bg-transparent border-b border-white/20 pb-2 text-white focus:outline-none focus:border-white transition-colors" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Data</label>
                      <input type="date" className="bg-transparent border-b border-white/20 pb-2 text-white focus:outline-none focus:border-white transition-colors [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Hora d'Inici</label>
                      <input type="time" className="bg-transparent border-b border-white/20 pb-2 text-white focus:outline-none focus:border-white transition-colors [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Ubicació / Població</label>
                    <input type="text" placeholder="Ex: Granollers, Barcelona..." className="bg-transparent border-b border-white/20 pb-2 text-white focus:outline-none focus:border-white transition-colors" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Durada Aprox. (h)</label>
                      <input type="number" placeholder="Ex: 4" className="bg-transparent border-b border-white/20 pb-2 text-white focus:outline-none focus:border-white transition-colors" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Assistents Aprox.</label>
                      <input type="number" placeholder="Ex: 150" className="bg-transparent border-b border-white/20 pb-2 text-white focus:outline-none focus:border-white transition-colors" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Estil Musical</label>
                    <input type="text" placeholder="Ex: Reggaeton, Techno, Èxits, Variat..." className="bg-transparent border-b border-white/20 pb-2 text-white focus:outline-none focus:border-white transition-colors" />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Comentaris / Detalls</label>
                    <textarea rows={4} placeholder="Explica'ns una mica més sobre la teva idea..." className="bg-transparent border-b border-white/20 pb-2 text-white focus:outline-none focus:border-white transition-colors resize-none"></textarea>
                  </div>

                  <button type="button" className="mt-8 px-10 py-5 bg-white text-black font-bold uppercase tracking-widest rounded-full hover:scale-[1.02] transition-transform duration-300 shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:shadow-[0_0_40px_rgba(255,255,255,0.3)]">
                    Enviar Sol·licitud
                  </button>
                </form>
              </div>
            </motion.div>

          </div>
        </div>
      </section>
    </div>
  );
}
